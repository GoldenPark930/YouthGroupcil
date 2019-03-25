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
            <h3 class="card-title">{{ $t("menu.regions") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">
                  <input class="form-control form-control-sm"
                         v-model="search.title"
                         type="text"
                         v-bind:placeholder="$t('labels.search')" />
                  <span class="input-group-btn ml-2">
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

                <table v-if="filteredList.length > 0"
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
                    <tr v-for="(item, index) in filteredList"
                        :key="index">
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>
                        <button v-on:click="hide(item)"
                                class="btn btn-primary"
                                v-show="item.published">{{ $t('actions.show') }}</button>
                        <button v-on:click="show(item)"
                                class="btn btn-warning"
                                v-show="!item.published">{{ $t('actions.hide') }}</button>
                      </td>
                      <td>
                        <button v-on:click="edit(item, index)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
                        <button v-on:click="remove(item, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
                      </td>
                    </tr>
                  </tbody>
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
        <div class="form-group">
          <label>{{ $t('labels.title') }}</label>
          <input class="form-control"
                 name="title"
                 type="text"
                 placeholder="Title"
                 v-bind:class="{'is-invalid': errors.title}"
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
            <div v-if="errors.published"
                 class="invalid-feedback">{{ errors.published.join(', ') }}</div>
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

        <button type="button"
                class="btn btn-default"
                :disabled="loading"
                @click="modal = false">{{ $t('actions.cancel') }}</button>
      </template>
    </modal>
  </div>
</template>

<script>
import axios from "axios";
import Modal from "./Modal.vue";

export default {
  components: {
    Modal
  },

  data() {
    return {
      regions: [],
      errors: [],
      modal: false,
      record: {
        title: "",
        published: false
      },
      loading: false,
      search: {
        title: ""
      }
    };
  },

  computed: {
    filteredList() {
      return this.regions.filter(record => {
        return record.title
          .toLowerCase()
          .includes(this.search.title.toLowerCase());
      });
    }
  },

  created() {
    this.getRegions();
  },

  methods: {
    getRegions() {
      this.loading = true;
      const params = _(this.search)
        .omitBy(_.isUndefined)
        .omitBy(_.isNull)
        .omitBy(_.isEmpty)
        .value();
      axios
        .get("/api/regions", {
          params: params
        })
        .then(response => {
          this.regions = response.data;
          this.loading = false;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    filter: function() {
      // this.getRegions()
    },

    hide: function(record) {
      axios
        .put(`/api/regions/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    show: function(record) {
      axios
        .put(`/api/regions/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    remove: function(record, index) {
      axios
        .delete(`/api/regions/${record.id}`)
        .then(response => {
          this.regions.splice(index, 1);
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

    edit: function(record) {
      this.record = record;
      this.modal = true;
      this.errors = [];
    },

    add: function() {
      this.modal = true;

      this.record = {
        title: "",
        published: false
      };

      this.errors = [];
    },

    create: function() {
      this.loading = true;

      let formData = new FormData();
      formData.append("title", this.record.title);
      formData.append("published", this.record.published ? 1 : 0);

      axios
        .post("/api/regions", formData)
        .then(response => {
          this.regions.unshift(response.data);
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
          this.loading = false;
        });
    },

    update: function() {
      this.loading = true;

      let data = {
        title: this.record.title,
        published: this.record.published ? 1 : 0
      };

      axios
        .put(`/api/regions/${this.record.id}`, data)
        .then(response => {
          // this.record = response.data

          let i = this.regions.map(item => item.id).indexOf(this.record.id);
          this.regions.splice(i, 1, response.data);

          this.modal = false;
          this.loading = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-updated')
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
    }
  }
};
</script>
