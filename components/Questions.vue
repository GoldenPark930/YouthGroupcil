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
            <h3 class="card-title">{{ $t("menu.questions") }}</h3>

            <div class="card-options">
              <form @submit.prevent="filter">
                <div class="input-group">
                  <input class="form-control form-control-sm"
                         v-model="search.name"
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
                   :class="{'min-height-300': loading}">

                <table v-if="list.data.length > 0"
                       class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.name') }}</th>
                      <th>{{ $t('labels.email') }}</th>
                      <th>{{ $t('labels.text') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in list.data"
                        :key="index">
                      <td>{{ item.id }}</td>
                      <td>{{ item.name }}</td>
                      <td>{{ item.email }}</td>
                      <td>{{ item.text | truncate(40) }}</td>
                      <td>
                        <button v-on:click="show(item)"
                                class="btn btn-primary">{{ $t('actions.show') }}</button>

                        <button v-on:click="remove(item, index)"
                                class="btn btn-danger">{{ $t('actions.remove') }}</button>
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

        <!-- <template v-if="!record.id">
          Add a new question
        </template> -->

        <template v-if="record.id">
          {{ $t('title.question-from') }} {{ record.name }}
        </template>
      </template>

      <form>

        <div class="form-group">
          <label>{{ $t('labels.name') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 disabled="disabled"
                 v-model="record.name"
                 :class="{ 'is-invalid': errors.name }"
                 placeholder="Name" />
          <div v-if="errors.name"
               class="invalid-feedback">{{ errors.name.join(', ') }}</div>
        </div>

        <div class="form-group">
          <label>{{ $t('labels.email') }} <span class="required">*</span></label>
          <input type="text"
                 disabled="disabled"
                 class="form-control"
                 v-model="record.email"
                 :class="{ 'is-invalid': errors.email }"
                 placeholder="Email" />
          <div v-if="errors.email"
               class="invalid-feedback">{{ errors.email.join(', ') }}</div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ $t('labels.text') }} <span class="required">*</span></label>
          <textarea class="form-control"
                    name="text"
                    rows="6"
                    disabled="disabled"
                    placeholder="Text"
                    v-model="record.text"></textarea>
        </div>

      </form>

      <template slot="footer">

        <!-- <template v-if="!record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  @click="create()">Save</button>
        </template> -->

        <!-- <template v-if="record.id">
          <button class="btn btn-primary"
                  :disabled="loading"
                  @click="update()">Update</button>
        </template> -->

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
        name: "",
        email: "",
        text: ""
      },
      loading: false,
      search: {
        name: ""
      }
    };
  },

  computed: {},

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
        .get(`/api/questions`, {
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

    show(item) {
      this.record = {
        id: item.id,
        name: item.name,
        email: item.email,
        text: item.text
      };

      this.modal = true;
    },

    remove: function(item, index) {
      axios
        .delete(`/api/questions/${item.id}`)
        .then(response => {
          this.list.data.splice(index, 1);
          this.$notify({
            group: "app",
            type: "success",
            text: this.$t('notifications.record-removed')
          });
        })
        .catch(e => this.$noty.error(e.message));
    }
  }
};
</script>
