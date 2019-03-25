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
            <h3 class="card-title">{{ $t("menu.content") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">

                  <input class="form-control form-control-sm"
                         v-model="search.title"
                         type="text"
                         v-bind:placeholder="$t('labels.search')" />

                  <span class="input-group-btn ml-2">
                    <!-- <button v-on:click="refresh()"
                            type="button"
                            :disabled="loading"
                            class="btn btn-sm btn-default">{{ $t('actions.update-from-facebook') }}</button> -->

                    <button v-on:click="add()"
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

                <table v-if="list.data.length > 0"
                       class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.title') }}</th>
                      <th>{{ $t('labels.published') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in list.data"
                        :key="index">
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>
                        <button v-on:click="show(item)"
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
                                class="btn btn-danger"><i class="fe fe-trash"></i></button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p v-if="list.data.length === 0 && loading === false"
                   class='empty'>Нічого не знайдено</p>
              </div>
            </div>
          </div>
        </div>

        <pagination :pagination="list"
                    @paginate="getList()"
                    :offset="4">
        </pagination>

      </div>
    </div>

    <modal v-show="modal"
           @close="modal = false">

      <template slot="header">
        <template v-if="!record.id">
          Додати новий контент
        </template>
        <template v-if="record.id">
          Редагувати контент: {{ record.title }}
        </template>
      </template>

      <form>

        <div class="form-group">
          <label class="form-label">{{ $t('labels.title') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 v-model="record.title"
                 :class="{ 'is-invalid': errors.title }"
                 placeholder="Title" />
          <div v-if="errors.title"
               class="invalid-feedback">{{ errors.title.join(', ') }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">{{ $t('labels.preview') }}</div>
          <textarea :class="{ 'is-invalid': errors.preview }"
                    class="form-control"
                    name="preview"
                    rows="6"
                    placeholder=""
                    v-model="record.preview"></textarea>
          <div v-if="errors.preview"
               class="invalid-feedback">{{ errors.preview.join(', ') }}</div>
        </div>

        <div class="form-group">
          <div class="form-label">{{ $t('labels.text') }}</div>
          <jodit-vue 
            v-model="record.text" 
            :id="'editor-content-text'"
            :defaultValue="defaultValue" 
            :config="config"></jodit-vue>
          <div v-if="errors.text"
               class="invalid-feedback">{{ errors.text.join(', ') }}</div>
        </div>

        <!-- published -->
        <div class="form-group">
          <div class="form-label">{{ $t('labels.published') }}</div>
          <div class="custom-switches-stacked">
            <label class="custom-switch">
              <input type="checkbox"
                      name="published"
                      v-model="record.published"
                      value="1"
                      class="custom-switch-input">
              <span class="custom-switch-indicator"></span>
              <span class="custom-switch-description" v-if="record.published">{{ $t('labels.enable') }}</span>
              <span class="custom-switch-description" v-if="!record.published">{{ $t('labels.disable') }}</span>
            </label>
          </div>
        </div>

        <div class="row" v-if="image">
          <div class="col">
            <div class="form-group">
              <img :src="image" class="img-thumbnail" alt="" style="max-width: 200px;" />
            </div>
          </div>
        </div>

        <div class="row" v-if="record.image && !image">
          <div class="col">
            <div class="form-group">
              <img :src="record.image" class="img-thumbnail" alt="" style="max-width: 200px;" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="form-group">
              <div class="form-label">{{ $t('labels.image') }}</div>
              <div class="custom-file">
                <input type="file"
                        @change="onFileChange($event)"
                        class="custom-file-input"
                        name="image">
                <label class="custom-file-label">{{ (file && file.name) || 'Choose file' }}</label>
              </div>
            </div>
          </div>
        </div>
      </form>

      <template slot="footer">

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

        <button class="btn btn-secondary"
                type="button"
                :disabled="loading"
                @click="modal = false">{{ $t('actions.cancel') }}</button>
      </template>
    </modal>

  </div>
</template>

<script>
import axios from "axios";
import Modal from "./Modal.vue";
import Pagination from "./Pagination.vue";
import _ from "lodash";
import JoditVue from './Jodit'

export default {
  components: {
    Modal,
    Pagination,
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

      errors: [],
      list: {
        total: 0,
        per_page: 10,
        from: 1,
        to: 0,
        last_page: 0,
        current_page: 1,
        data: []
      },
      modal: false,
      loading: false,
      search: {
        title: ''
      },

      record: {
        title: '',
        preview: '',
        text: '',
        published: false
      },

      file: null,
      image: null,

      defaultValue: '',
      modal: false
    };
  },

  created() {
    this.getList();
  },

  methods: {

    getList() {
      this.loading = true;
      // const params = _(this.search).omitBy(_.isUndefined).omitBy(_.isNull).omitBy(_.isEmpty).value()

      const params = Object.assign(
        _(this.search)
          .omitBy(_.isUndefined)
          .omitBy(_.isNull)
          .omitBy(_.isEmpty)
          .value(),
        { page: this.list.current_page }
      );

      axios
        .get(`/api/content`, {
          params: params
        })
        .then(response => {
          this.list = response.data;
          this.loading = false;
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }
        });
    },

    add() {
      this.record = {
        title: "",
        text: "",
        preview: '',
        published: false
      };

      this.defaultValue = '<p></p>';

      this.modal = true;
      this.errors = [];
    },

    edit: function(item) {
      this.record = {
        id: item.id,
        title: item.title,
        preview: item.preview,
        text: item.text,
        published: item.published,
        image: item.image
      };

      this.modal = true;
      this.errors = [];

      this.defaultValue = (item.text == null) ? "<p></p>" : item.text;
    },

    create: function() {
      this.loading = true;

      let formData = new FormData();
      formData.append("title", this.record.title);
      formData.append("preview", this.record.preview);
      formData.append("text", this.record.text);
      formData.append("published", parseInt(this.record.published));
      formData.append("image", this.file);

      axios
        .post("/api/content", formData)
        .then(response => {
          this.list.data.unshift(response.data);
          this.modal = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-created')
          });
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

    update: function() {
      this.loading = true;

      axios
        .put(`/api/content/${this.record.id}`, this.record)
        .then(response => {
          let i = this.list.data.map(item => item.id).indexOf(response.data.id);
          this.list.data.splice(i, 1, response.data);
          
          if (this.file) {
            let formData = new FormData();
            formData.append("image", this.file);

            axios
              .post(`/api/content/${this.record.id}/upload`, formData)
              .then(response => {
                this.modal = false;
                this.loading = false;

                this.$notify({
                  group: "app",
                  type: "success",
                  text: this.$t('notifications.record-updated')
                });
              });

          } else {

            this.modal = false;
            this.loading = false;

            this.$notify({
              group: "app",
              type: "success",
              text: this.$t('notifications.record-updated')
            });
          }
        })
        .catch(e => {
          if (e.response && e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }

          this.loading = false;
        });
    },

    filter() {
      this.getList();
    },

    show: function(record) {
      axios
        .put(`/api/content/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    remove: function(item, index) {
      axios
        .delete(`/api/content/${item.id}`)
        .then(response => {
          this.list.data.splice(index, 1);
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

    // refresh() {
    //   this.loading = true;

    //   axios
    //     .get(`/api/content/refresh`)
    //     .then(response => {
    //       this.loading = false;
    //       this.getList();
    //     })
    //     .catch(e => {
    //       if (e.response.status === 422) {
    //         this.errors = e.response.data.errors;
    //       } else {
    //         this.$notify({ group: "app", type: "error", text: e.message });
    //       }
    //     });
    // }

    // Image
    onFileChange(e) {
      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;

      this.file = files[0];
      this.createImage(files[0]);
    },

    createImage(file) {
      let image = new Image();
      let reader = new FileReader();

      reader.onload = e => {
        this.image = e.target.result;
      };

      reader.readAsDataURL(file);
    },

    removeImageTemp: function(e) {
      this.image = null;
      this.file = null;
    },
  }
};
</script>
