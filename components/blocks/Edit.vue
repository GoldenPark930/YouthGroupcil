<template>
  <div class="container">

    <div class="page-header">
      <h1 class="page-title">
        {{ $t('title.edit-record') }} : {{ record.title }}
      </h1>
    </div>

    <div class="row row-cards row-deck">

      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Info</h3>
          </div>

          <div class="card-body">
            <form>
              <div class="form-group">
                <label class="form-label">{{ $t('labels.title') }} <span>*</span></label>
                <input type="text"
                       class="form-control"
                       name="title"
                       placeholder="Title"
                       v-model="record.title" />
              </div>
            </form>
          </div>

          <div class="card-footer text-right">
            <div class="d-flex">
              <button type="button"
                      @click="updateB()"
                      class="btn btn-primary ml-auto">{{ $t('actions.save') }}</button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Steps -->
    <div class="row row-cards row-deck">

      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">{{ $t('labels.steps') }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">

                  <!-- <input class="form-control form-control-sm"
                         v-model="search.title"
                         type="text"
                         v-bind:placeholder="$t('labels.search')" /> -->

                  <span class="input-group-btn ml-2">
                    <button v-on:click="newStep()"
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

                <table v-if="record.steps.length > 0"
                       class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th></th>
                      <th>{{ $t('labels.id') }}</th>
                      <th>{{ $t('labels.title') }}</th>
                      <th>{{ $t('labels.files') }}</th>
                      <th>{{ $t('labels.published') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <draggable v-model="listSteps" :element="'tbody'">
                    <tr v-for="(step, index) in record.steps"
                        :key="index">
                      <td style="cursor: pointer;"><i class="fe fe-move"></i></td>
                      <td>{{ step.id }}</td>
                      <td>{{ step.title }}</td>
                      <td>{{ step.files.length }}</td>
                      <td>
                        <button v-on:click="hide(step)"
                                class="btn btn-primary"
                                v-show="step.published">{{ $t('actions.show') }}</button>
                        <button v-on:click="show(step)"
                                class="btn btn-warning"
                                v-show="!step.published">{{ $t('actions.hide') }}</button>
                      </td>
                      <td>
                        <button v-on:click="edit(step)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
                        <button v-on:click="remove(step, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
                      </td>
                    </tr>
                  </draggable>
                </table>

                <p v-if="record.steps.length === 0 && loading === false"
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
        <template v-if="!step.id">
          Add a new step
        </template>
        <template v-if="step.id">
          Edit step : {{ step.title }}
        </template>
      </template>

      <form>

        <div class="form-group" v-if="loading && progress > 0">
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
                 v-model="step.title" />
          <div v-if="errors.title"
               class="invalid-feedback">{{ errors.title.join(', ') }}</div>
        </div>

        <div class="form-group">
          <jodit-vue 
            :defaultValue="defaultValue"
            :config="config"
            v-model="step.text"></jodit-vue >
          <!-- <textarea :class="{'is-invalid': errors.text }"
                    class="form-control"
                    :name="'text'"
                    rows="6"
                    placeholder=""
                    v-model="step.text"></textarea> -->
          <div v-if="errors.text"
               class="invalid-feedback">{{ errors.text.join(', ') }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">{{ $t('labels.published') }}</div>
          <div class="custom-switches-stacked">
            <label class="custom-switch">
              <input type="checkbox"
                     name="published"
                     v-model="step.published"
                     value="1"
                     class="custom-switch-input" />
              <span class="custom-switch-indicator"></span>
              <span class="custom-switch-description" v-if="step.published">{{ $t('labels.enable') }}</span>
              <span class="custom-switch-description" v-if="!step.published">{{ $t('labels.disable') }}</span>
            </label>
          </div>
        </div>

        <div class="form-group" v-if="step.files.length > 0 || step.newFiles.length > 0">
          <div class="form-label">{{ $t('labels.files') }}</div>
          <div class="table-responsive">

            <table class="table mb-0">

              <thead>
                <tr>
                  <th class="pl-0">{{ $t('labels.name') }}</th>
                  <th>{{ $t('labels.file') }}</th>
                  <th class="pr-0">{{ $t('labels.actions') }}</th>
                </tr>
              </thead>

              <tbody>

                <tr v-for="(file, index) in step.files"
                    :key="index">

                  <td class="pl-0">
                    <input type="text"
                            :class="{'is-invalid': errors[`files.${index}.filename`] }"
                            class="form-control"
                            :name="'file-name-' + index"
                            v-model="file.filename" />
                    <div v-if="errors[`files.${index}.name`]"
                          class="invalid-feedback">{{ errors[`files.${index}.filename`].join(', ') }}</div>
                  </td>

                  <td>
                    <input type="text"
                            disabled="disabled"
                            class="form-control"
                            :name="'file-location-' + index"
                            v-model="file.location" />
                  </td>

                  <td class="pr-0">
                    <button type="button"
                            class="btn btn-danger"
                            :disabled="loading"
                            @click="deleteFile(file, index)"><i class="fe fe-trash"></i></button>
                  </td>
                </tr>
              </tbody>
              
              <tbody>
                <tr v-for="(file, index) in step.newFiles"
                    :key="index">

                  <td class="pl-0">
                    <input type="text"
                            :class="{'is-invalid': errors[`files.${index}.name`] }"
                            class="form-control"
                            :name="'new-file-name-' + index"
                            v-model="file.name" />
                    <div v-if="errors[`files.${index}.name`]"
                          class="invalid-feedback">{{ errors[`files.${index}.name`].join(', ') }}</div>
                  </td>

                  <td>
                    <div class="custom-file">
                      <input type="file"
                            @change="onFileChange($event, index)"
                            class="custom-file-input"
                            :name="'new-file-' + index">
                      <label class="custom-file-label">{{ (file.file && file.file.name) || 'Choose file' }}</label>
                    </div>
                  </td>

                  <td class="pr-0">
                    <button type="button"
                            class="btn btn-danger"
                            :disabled="loading"
                            @click="removeFile(index)"><i class="fe fe-trash"></i></button>
                  </td>

                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </form>

      <template slot="footer">

        <button type="button"
                class="btn btn-outline-primary"
                :disabled="loading"
                @click="newFile()">{{ $t('actions.add-file') }}</button>

        <template v-if="!step.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  type="button"
                  @click="create()">{{ $t('actions.save') }}</button>
        </template>

        <template v-if="step.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  type="button"
                  @click="update()">{{ $t('actions.save') }}</button>
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
import draggable from 'vuedraggable'
import JoditVue from './../Jodit'

export default {
  
  components: {
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

      loading: false,
      progress: 0,
      recordID: null,

      modal: false,

      record: {
        title: '',
        published: false,
        steps: [ ]
      },

      step: {
        title: '',
        text: '',
        published: false,
        newFiles: [
          {
            file: null,
            name: ''
          }
        ],
        files: [ ]
      },

      errors: [],

      search: {
        title: ''
      },
      defaultValue: ''
    };
  },

  computed: {
    listSteps: {
      get() {
        return this.record.steps
      },
      set(value) {
        this.record.steps = value
        this.updatePosition()
      }
    }
  },

  created() {
    this.recordID = this.$route.params.id;

    axios
      .get(`/api/blocks/${this.recordID}`)
      .then(response => {
        this.record = response.data;
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

  methods: {

    updatePosition() {

      this.loading = true;

      const list = this.record.steps.map((x, index) => {
        return {
          'id': x.id,
          'position': (index + 1)
        }
      });

      axios
        .post("/api/steps/position", { steps: list })
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

    updateB() {
      this.loading = true;
      axios
        .put(`/api/blocks/${this.recordID}`, this.record)
        .then(response => {
          
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-updated')
          });

          this.record = Object.assign(this.record, response.data)
          this.loading = false;
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

    hide: function(record) {
      axios
        .put(`/api/steps/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    show: function(record) {
      axios
        .put(`/api/steps/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    update: function() {
      this.loading = true;
    },

    newStep: function() {
      this.step = {
        title: "",
        text: "",
        published: false,
        files: [],
        newFiles: [
          {
            file: "",
            name: ""
          }
        ]
      };

      this.errors = [];
      this.defaultValue = '<p></p>';
      this.modal = true;
    },

    newFile() {
      this.step.newFiles.push({
        file: null,
        name: ''
      });
    },

    // TODO: Remove from DB if ID exist
    removeFile(index) {
      this.step.newFiles.splice(index, 1);
    },

    deleteFile(item, index) {
      axios
        .delete(`/api/files/${item.id}`)
        .then(response => {
          this.step.files.splice(index, 1);
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.file-removed')
          });
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },
    // END Control

    create() {
      this.loading = true;
      this.progress = 0;

      let formData = new FormData();

      formData.append("block_id", this.recordID);
      formData.append("title", this.step.title);
      formData.append("published", this.step.published ? 1 : 0);
      formData.append("text", this.step.text);

      for (var j = 0; j < this.step.newFiles.length; j++) {
        formData.append(`files[${j}][name]`, this.step.newFiles[j].name);
        formData.append(`files[${j}][file]`, this.step.newFiles[j].file);
      }

      axios
        .post("/api/steps", formData, {
          onUploadProgress: progressEvent => {
            this.progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed();
          }
        })
        .then(response => {
          this.record.steps.push(response.data);
          this.modal = false;
          this.loading = false;
          this.progress = 0;
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

          this.loading = false;
          this.progress = 0;
        });
    },

    edit(step) {

      this.step = Object.assign(
        {}, 
        step, 
        { newFiles: [] },
        { text: (step.text == null) ? "<p></p>" : step.text }
      );

      this.modal = true;
      this.defaultValue = (step.text == null) ? "<p></p>" : step.text;
      this.errors = [];
    },

    update() {
      this.loading = true;
      axios
        .put(`/api/steps/${this.step.id}`, this.step)
        .then(response => {
          
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-updated')
          });

          // If have new files
          if (this.step.newFiles.length > 0) {
            this.upload();
          } else {

            let i = this.record.steps.map(item => item.id).indexOf(response.data.id);
            // this.record.steps.splice(i, 1, response.data);
            if (i !== -1) {
              // this.record.steps.$set(i, response.data);
              this.$set(this.record.steps, i, response.data);
            }

            this.modal = false;
            this.loading = false;
          }
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

    upload() {
      this.loading = true;
      this.progress = 0;

      let formData = new FormData();
      formData.append('step', this.step.id);

      for (var j = 0; j < this.step.newFiles.length; j++) {
        formData.append(`files[${j}][name]`, this.step.newFiles[j].name);
        formData.append(`files[${j}][file]`, this.step.newFiles[j].file);
      }

      axios
        .post(`/api/steps/${this.step.id}/upload`, formData, {
          onUploadProgress: progressEvent => {
            this.progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed();
          }
        })
        .then(response => {

          let i = this.record.steps.map(item => item.id).indexOf(response.data.id);
          // this.record.steps.splice(i, 1, response.data);
          if (i !== -1) {
            // this.record.steps.$set(i, response.data);
            this.$set(this.record.steps, i, response.data);
          }

          this.modal = false;
          this.loading = false;
          this.progress = 0;

          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.file-created')
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

    remove: function(step, index) {
      axios
        .delete(`/api/steps/${step.id}`)
        .then(response => {
          this.record.steps.splice(index, 1);
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

    back: function() {
      this.$router.push({ name: "instruction" });
    },

    // Add file
    onFileChange(e, index) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      
      const file = files[0];

      if (file && file.size < (1024 * 1024 * 50)) {
        this.step.newFiles[index].file = file;
      } else {
        this.$notify({ group: "app", type: "error", text: 'Файл більше 50 Мб.' })
      }
    }
  }
};
</script>
