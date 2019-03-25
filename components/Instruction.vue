<template>
  <div class="container">

    <!-- <div class="page-header">
        <h1 class="page-title">
          Dashboard
        </h1>
      </div> -->

    <div class="row row-cards row-deck">

      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t("menu.instructions") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">

                  <!-- <input class="form-control form-control-sm"
                         v-model="search.title"
                         type="text"
                         v-bind:placeholder="$t('labels.search')" /> -->

                  <span class="input-group-btn ml-2">
                    <button v-on:click="newBlock()"
                            type="button"
                            class="btn btn-sm btn-default">{{ $t('actions.create') }}</button>
                  </span>
                </div>
              </form>
            </div>
          </div>

          <div class="table-responsive">
            <div class="dimmer"
                 :class="{ 'active': loading }">
              <div class="loader"
                   v-show="loading"></div>
              <div class="dimmer-content"
                   :class="{ 'min-height-300': loading }">

                <table v-if="filteredList.length > 0"
                       ref="blocksRef"
                       class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th></th>
                      <th class='handle'>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.title') }}</th>
                      <th>{{ $t('labels.steps') }}</th>
                      <th>{{ $t('labels.files') }}</th>
                      <th>{{ $t('labels.published') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <draggable v-model="filteredList" :element="'tbody'">
                    <tr v-for="(item, index) in filteredList"
                        :key="index">
                      <td style="cursor: pointer;"><i class="fe fe-move"></i></td>
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>{{ item.steps.length }}</td>
                      <td>{{ item.steps.map(x => x.files.length).reduce((a, b) => a + b, 0) }}</td>
                      <td>
                        <button v-on:click="hide(item)"
                                class="btn btn-primary"
                                v-show="item.published">{{ $t('actions.show') }}</button>
                        <button v-on:click="show(item)"
                                class="btn btn-warning"
                                v-show="!item.published">{{ $t('actions.hide') }}</button>
                      </td>
                      <td>
                        <button v-on:click="edit(item)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
                        <button v-on:click="remove(item, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
                      </td>
                    </tr>
                  </draggable>
                </table>

                <p v-if="filteredList.length === 0 && loading === false"
                   class='empty'>Нічого не знайдено</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <modal v-show="modal"
           @close="modal = false">
      <template slot="header">
        <template v-if="!record.id">
          {{ $t('title.add-new-record') }}
        </template>
        <template v-if="record.id">
          {{ $t('title.edit-record') }}: {{ record.title }}
        </template>
      </template>

      <form>
        
        <div class="form-group" v-if="loading">
          <div class="progress">
            <div 
              class="progress-bar progress-bar-striped progress-bar-animated" 
              role="progressbar" 
              :aria-valuenow="progress" 
              aria-valuemin="0" 
              aria-valuemax="100" 
              v-bind:style="{ width: progress + '%' }"></div>
          </div>
        </div>

        <div class="form-group">
          <label>{{ $t('labels.title') }}</label>
          <input class="form-control"
                 name="title"
                 type="text"
                 placeholder="Title"
                 v-bind:class="{ 'is-invalid': errors.title }"
                 v-model="record.title" />
          <div v-if="errors.title"
               class="invalid-feedback">{{ errors.title.join(', ') }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">{{ $t('labels.published') }}</div>
          <div class="custom-switches-stacked">
            <label class="custom-switch">
              <input type="checkbox"
                     name="published"
                     v-model="record.published"
                     value="1"
                     class="custom-switch-input" />
              <span class="custom-switch-indicator"></span>
              <span class="custom-switch-description" v-if="record.published">{{ $t('labels.enable') }}</span>
              <span class="custom-switch-description" v-if="!record.published">{{ $t('labels.disable') }}</span>
            </label>
          </div>
        </div>

        <div class="form-label">{{ $t('labels.steps') }}</div>
        <div class="table-responsive">
          <table class="table mb-0">
            <thead>
              <tr>
                <th class="pl-0">{{ $t('labels.title') }}</th>
                <th class="pr-0">{{ $t('labels.text') }}</th>
              </tr>
            </thead>
            <tr v-for="(step, index) in record.steps"
                :key="index">

              <td class="pl-0">
                <div class="form-group">
                  <input type="text"
                         :class="{'is-invalid': errors[`steps.${index}.title`] }"
                         class="form-control"
                         :name="'title-' + index"
                         v-model="step.title" />
                  <div v-if="errors[`steps.${index}.title`]"
                       class="invalid-feedback">{{ errors[`steps.${index}.title`].join(', ') }}</div>
                </div>

                <div class="form-group">
                  <div class="form-label">{{ $t('labels.published') }}</div>
                  <div class="custom-switches-stacked">
                    <label class="custom-switch">
                      <input type="checkbox"
                             :name="'published-' + index"
                             v-model="step.published"
                             value="1"
                             class="custom-switch-input">
                      <span class="custom-switch-indicator"></span>
                      <span class="custom-switch-description">{{ $t('labels.enable') }}</span>
                    </label>
                  </div>
                </div>
              </td>

              <td class="pr-0">
                <div class="form-group">
                  <jodit-vue 
                    v-model="step.text" 
                    :id="'editor-' + index"
                    :defaultValue="defaultValue" 
                    :config="config"></jodit-vue>
                  <!-- <textarea :class="{'is-invalid': errors[`steps.${index}.text`] }"
                            class="form-control"
                            :name="'text-' + index"
                            rows="6"
                            placeholder=""
                            v-model="step.text"></textarea> -->
                  <div v-if="errors[`steps.${index}.text`]"
                       class="invalid-feedback">{{ errors[`steps.${index}.text`].join(', ') }}</div>
                </div>

                <div class="form-group"
                     v-for="(file, indexF) in step.files"
                     :key="indexF">

                  <div class="form-group">
                    <div class="form-label">File Name</div>
                    <input type="text"
                           :class="{'is-invalid': errors[`steps.${index}.files.${indexF}.name`] }"
                           class="form-control"
                           :name="'file-name-' + index + '-' + indexF"
                           v-model="file.name" />
                    <div v-if="errors[`steps.${index}.files.${indexF}.name`]"
                         class="invalid-feedback">{{ errors[`steps.${index}.files.${indexF}.name`].join(', ') }}</div>
                  </div>

                  <div class="row gutters-xs">
                    <div class="col">
                      <div class="custom-file">
                        <input type="file"
                               @change="onFileChange($event, index, indexF)"
                               class="custom-file-input"
                               :name="'file-' + index + '-' + indexF">
                        <label class="custom-file-label">{{ (file.file && file.file.name) || 'Choose file' }}</label>
                      </div>
                    </div>

                    <span class="col-auto pr-0">
                      <button type="button"
                              class="btn btn-danger"
                              :disabled="loading"
                              @click="removeFile(index, indexF)"><i class="fe fe-trash"></i></button>
                    </span>
                  </div>
                </div>

                <button type="button"
                        class="btn btn-secondary"
                        :disabled="loading"
                        @click="newFile(index)">{{ $t('actions.add-file') }}</button>
              </td>
            </tr>
          </table>
        </div>
      </form>

      <template slot="footer">

        <button type="button"
                class="btn btn-outline-primary"
                :disabled="loading"
                @click="newStep()">{{ $t('actions.add-step') }}</button>

        <template v-if="!record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  @click="create()">{{ $t('actions.save') }}</button>
        </template>

        <template v-if="record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  @click="update()">{{ $t('actions.update') }}</button>
        </template>

        <button type="button"
                class="btn btn-secondary"
                :disabled="loading"
                @click="modal = false">{{ $t('actions.cancel') }}</button>
      </template>
    </modal>

  </div>

</template>

<script>
import axios from "axios";
import Modal from "./Modal.vue";
import draggable from 'vuedraggable';
import JoditVue from './Jodit'

export default {
  components: {
    Modal,
    draggable,
    JoditVue
  },

  data() {
    return {
      config: {
        // uploader: {
        //   "insertImageAsBase64URI": true
        // },
        enableDragAndDropFileToEditor: true,
        uploader: {
          url: '/api/client/upload',
          headers: {
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
          }
        },
        filebrowser: {
          // buttons: ['list', 'tiles', 'sort'],
          buttons: [ 'tiles' ],
          ajax: {
            url: '/api/client/files',
            headers: {
              'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
          }
        },
      },

      list: [],
      errors: [],
      modal: false,
      progress: 0,

      record: {
        title: "",
        published: false,
        steps: [
          {
            title: "",
            text: "",
            published: false,
            files: [
              {
                file: "",
                name: ""
              }
            ]
          }
        ]
      },
      loading: false,
      search: {
        title: ""
      },
      defaultValue: ''
    };
  },

  computed: {
    filteredList: {
      get() {
        return this.list.filter(record => {
          return record.title
            .toLowerCase()
            .includes(this.search.title.toLowerCase());
        });
      },
      set(value) {
        this.list = value
        this.updatePosition()
      }
    }
  },

  created() {
    this.getList();
  },

  methods: {

    updatePosition() {

      this.loading = true;

      const list = this.list.map((x, index) => {
        return {
          'id': x.id,
          'position': (index + 1)
        }
      });

      axios
        .post("/api/blocks/position", { blocks: list })
        .then(response => {
          this.loading = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.position-updated')
          });
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }
          this.loading = false;
        });
    },

    getList() {
      this.loading = true;
      const params = _(this.search)
        .omitBy(_.isUndefined)
        .omitBy(_.isNull)
        .omitBy(_.isEmpty)
        .value();

      axios
        .get("/api/blocks", {
          params: params
        })
        .then(response => {
          this.list = response.data;
          this.loading = false;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    hide: function(record) {
      axios
        .put(`/api/blocks/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    show: function(record) {
      axios
        .put(`/api/blocks/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    // BEGIN Control
    newBlock() {
      this.record = {
        title: "",
        published: false,
        steps: [
          {
            title: "",
            text: "",
            published: false,
            files: [
              {
                file: null,
                name: ""
              }
            ]
          }
        ]
      };

      this.errors = [];
      this.modal = true;
    },

    newStep() {
      this.record.steps.push({
        title: "",
        text: "",
        published: false,
        files: [
          {
            file: null,
            name: ""
          }
        ]
      });

      this.defaultValue = '<p></p>';
    },

    // TODO: Remove from DB if ID exist
    removeStep(index) {
      this.record.steps.splice(index, 1);
    },

    newFile(index) {
      this.record.steps[index].files.push({
        file: null,
        name: ''
      });
    },

    // TODO: Remove from DB if ID exist
    removeFile(index, indexF) {
      this.record.steps[index].files.splice(indexF, 1);
    },
    // END Control

    create() {
      this.loading = true;
      this.progress = 0;

      let formData = new FormData();
      formData.append("title", this.record.title);
      formData.append('published', this.record.published ? 1 : 0);

      for (var i = 0; i < this.record.steps.length; i++) {

        formData.append(`steps[${i}][title]`, this.record.steps[i].title);
        formData.append(`steps[${i}][text]`, this.record.steps[i].text);
        formData.append(`steps[${i}][published]`, this.record.steps[i].published ? 1 : 0);

        for (var j = 0; j < this.record.steps[i].files.length; j++) {
          formData.append(`steps[${i}][files][${j}][name]`, this.record.steps[i].files[j].name);
          formData.append(`steps[${i}][files][${j}][file]`, this.record.steps[i].files[j].file);
        }
      }

      axios
        .post("/api/blocks", formData, {
          onUploadProgress: progressEvent => {
            this.progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed();
          }
        })
        .then(response => {

          this.progress = 0;
          this.list.push(response.data);
          this.modal = false;
          this.loading = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-created')
          });
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }

          this.progress = 0;
          this.loading = false;
        });
    },

    remove: function(record, index) {
      axios
        .delete(`/api/blocks/${record.id}`)
        .then(response => {
          this.list.splice(index, 1);
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-removed')
          });
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    edit(item) {
      this.$router.push({ name: "block-edit", params: { id: item.id } });
    },

    // Add file
    onFileChange(e, index, indexF) {

      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;

      const file = files[0];

      if (file && file.size < (1024 * 1024 * 50)) {
        this.record.steps[index].files[indexF].file = file;
      } else {
        this.$notify({ group: "app", type: "error", text: 'Файл більше 50 Мб.' })
      }
    }
  }
};
</script>
