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
            <h3 class="card-title">{{ $t("menu.users") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">
                  <input class="form-control form-control-sm"
                         v-model="search.name"
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

                <table v-if="users.data.length > 0" class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.name') }}</th>
                      <th>{{ $t('labels.email') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(user, index) in users.data"
                        :key="index">
                      <td>{{ user.id }}</td>
                      <td>{{ user.name }}</td>
                      <td>{{ user.email }}</td>
                      <td>
                        <button v-on:click="edit(user)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
                        <button v-on:click="remove(user, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <p v-if="users.data.length === 0 && loading === false" class='empty'>Нічого не знайдено</p>
              </div>
            </div>
          </div>
        </div>

        <pagination :pagination="users"
                    @paginate="getUsers()"
                    :offset="4">
        </pagination>

      </div>
    </div>

    <modal v-show="modal"
           @close="modal = false">

      <template slot="header">
        <template v-if="!record.id">
          Add a new user
        </template>
        <template v-if="record.id">
          Edit user {{ record.name }}
        </template>
      </template>

      <form>

        <div class="form-group">
          <label>{{ $t('labels.name') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 name="name"
                 v-model="record.name"
                 :class="{ 'is-invalid': errors.name }"
                 placeholder="Name" />
          <div v-if="errors.name"
               class="invalid-feedback">{{ errors.name.join(', ') }}</div>
        </div>

        <div class="form-group">
          <label>{{ $t('labels.email') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 v-model="record.email"
                 :class="{ 'is-invalid': errors.email }"
                 placeholder="Email" />
          <div v-if="errors.email"
               class="invalid-feedback">{{ errors.email.join(', ') }}</div>
        </div>

        <div class="form-group">
          <label>{{ $t('labels.password') }}</label>
          <input type="password"
                 class="form-control"
                 v-model="record.password"
                 :class="{ 'is-invalid': errors.password }"
                 placeholder="Password" />
          <div v-if="errors.password"
               class="invalid-feedback">{{ errors.password.join(', ') }}</div>
        </div>
      </form>

      <template slot="footer">
        <template v-if="!record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  type="button"
                  @click="create()">{{ $t('actions.save') }}</button>
        </template>

        <template v-if="record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  type="button"
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
      users: {
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
        name: "",
        email: "",
        password: ""
      },
      loading: false,
      search: {
        name: ""
      }
    };
  },

  computed: {},

  created() {
    this.getUsers();
  },

  methods: {
    getUsers() {
      this.loading = true;
      // const params = _(this.search).omitBy(_.isUndefined).omitBy(_.isNull).omitBy(_.isEmpty).value()

      const params = Object.assign(
        _(this.search)
          .omitBy(_.isUndefined)
          .omitBy(_.isNull)
          .omitBy(_.isEmpty)
          .value(),
        { page: this.users.current_page }
      );

      axios
        .get(`/api/users`, {
          params: params
        })
        .then(response => {
          this.users = response.data;
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
      this.getUsers();
      return false;
    },

    edit: function(user) {
      this.record = {
        id: user.id,
        name: user.name,
        email: user.email,
        password: ''
      };

      this.modal = true;
      this.errors = [];
    },

    add: function() {
      this.record = {
        name: '',
        email: '',
        password: ''
      };

      this.modal = true;
      this.errors = [];
    },

    create: function() {
      let user = this.record;
      this.loading = true;

      axios
        .post("/api/users", user)
        .then(response => {
          this.users.data.push(response.data);
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
      let user = this.record;
      this.loading = true;

      axios
        .put(`/api/users/${user.id}`, user)
        .then(response => {
          let i = this.users.data.map(item => item.id).indexOf(user.id);
          this.users.data.splice(i, 1, response.data);

          this.modal = false;
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-updated')
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

    remove: function(user, index) {
      axios
        .delete(`/api/users/${user.id}`)
        .then(response => {
          this.users.data.splice(index, 1);
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-removed')
          });
        })
        .catch(e => {
          this.$notify({ group: "app", type: "error", text: e.message });
        });
    }
  }
};
</script>
