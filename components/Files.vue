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
            <h3 class="card-title">{{ $t("menu.files") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">
                  <input class="form-control form-control-sm"
                         v-model="search.filename"
                         type="text"
                         v-bind:placeholder="$t('labels.search')" />

                  <!-- <span class="input-group-btn ml-2">
                    <button v-on:click="add()"
                            type="button"
                            class="btn btn-sm btn-default">{{ $t('actions.create') }}</button>
                  </span> -->
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
                   
                <table v-if="list.data.length > 0" class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.filename') }}</th>
                      <th>{{ $t('actions.download') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in list.data"
                        :key="index">
                      <td>{{ item.id }}</td>
                      <td>{{ item.filename }}</td>
                      <td><a :href="item.location" class="btn btn-primary" target="_blank"><i class="fe fe-download"></i></a></td>
                      <td>
                        <button v-on:click="edit(item)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
                        <button v-on:click="remove(item, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p v-if="list.data.length === 0 && loading === false" class='empty'>Нічого не знайдено</p>
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
          {{ $t('title.add-new-file') }}
        </template>
        <template v-if="record.id">
          {{ $t('title.edit-file') }}: {{ record.filename }}
        </template>
      </template>

      <form>

        <!-- <div class="form-group">
          <label>Step</label>
          <select class="form-control custom-select"
                  v-model="record.step">
            <option v-for="(option, key) in steps"
                    :disable="record.id"
                    :key="key"
                    :value="key">{{ option }}</option>
          </select>
        </div> -->

        <div class="form-group">
          <label>{{ $t('labels.filename') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 v-model="record.filename"
                 :class="{ 'is-invalid': errors.filename }"
                 placeholder="Name" />
          <div v-if="errors.filename"
               class="invalid-feedback">{{ errors.filename.join(', ') }}</div>
        </div>

        <!-- <div class="form-group">
          <div class="custom-file">
            <input type="file"
                    :disable="record.id"
                    @change="onFileChange($event)"
                    class="custom-file-input"
                    :name="'file'">
            <label class="custom-file-label">{{ (file && file.name) || 'Choose file' }}</label>
          </div>
        </div> -->
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

        <button class="btn btn-default"
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

export default {
  components: {
    Modal,
    Pagination
  },

  data() {
    return {
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
      record: {
        filename: ''
      },
      loading: false,
      search: {
        filename: ''
      },
      file: {
        file: null,
        name: ''
      },
      steps: []
    };
  },

  computed: {},

  created() {
    this.getSteps();
    this.getList();
  },

  methods: {

    getSteps() {
      axios
        .get(`/api/steps/list`)
        .then(response => {
          this.steps = response.data;
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
        .get(`/api/files`, {
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

    filter() {
      this.getList();
    },

    edit: function(item) {
      this.record = {
        id: item.id,
        filename: item.filename
      };

      this.modal = true;
      this.errors = [];
    },

    add: function() {
      this.record = {
        filename: "",
      };

      this.modal = true;
      this.errors = [];
    },

    create: function() {
      this.loading = true;

      axios
        .post("/api/files", this.record)
        .then(response => {
          this.list.data.push(response.data);
          this.modal = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.file-created')
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
        .put(`/api/files/${this.record.id}`, this.record)
        .then(response => {
          let i = this.list.data.map(item => item.id).indexOf(this.record.id);
          this.list.data.splice(i, 1, response.data);

          this.modal = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.file-updated')
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

    remove: function(item, index) {
      axios
        .delete(`/api/files/${item.id}`)
        .then(response => {
          this.list.data.splice(index, 1);
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.file-removed')
          });
        })
        .catch(e => this.$notify({ group: "app", type: "error", text: e.message }));
    },

    // Add file
    onFileChange(e) {

      let files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;

      this.file = files[0];
    }
  }
};
</script>
