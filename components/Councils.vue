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
            <h3 class="card-title">{{ $t("menu.councils") }}</h3>

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

                <table v-if="list.data.length > 0"
                       class="table card-table table-vcenter text-nowrap">
                  <thead>
                    <tr>
                      <th>{{ $t("labels.id") }}</th>
                      <th>{{ $t('labels.title') }}</th>
                      <th>{{ $t('labels.phones') }}</th>
                      <th>{{ $t('labels.published') }}</th>
                      <th>{{ $t('labels.approved') }}</th>
                      <th>{{ $t('labels.actions') }}</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="(item, index) in list.data"
                        :key="index">
                      <td>{{ item.id }}</td>
                      <td>{{ item.title }}</td>
                      <td>
                        <template v-if="item.phones && item.phones.length > 0">{{ item.phones[0].phone }}</template>
                      </td>
                      <td>
                        <button v-on:click="show(item)"
                                class="btn btn-primary"
                                v-show="item.published">{{ $t('actions.show') }}</button>
                        <button v-on:click="show(item)"
                                class="btn btn-warning"
                                :disabled="!item.approved"
                                v-show="!item.published">{{ $t('actions.hide') }}</button>
                      </td>

                      <td>
                        <button v-on:click="approve(item)"
                                class="btn btn-success"
                                v-show="item.approved">{{ $t('actions.yes') }}</button>
                        <button v-on:click="approve(item)"
                                class="btn btn-danger"
                                v-show="!item.approved">{{ $t('actions.no') }}</button>
                      </td>

                      <td>
                        <button v-on:click="edit(item)"
                                class="btn btn-primary">{{ $t('actions.edit') }}</button>
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
        <template v-if="!record.id">
          Додати нову раду
        </template>
        <template v-if="record.id">
          Редагувати раду {{ record.title }}
        </template>
      </template>

      <form>

        <div class="form-group">
          <label>{{ $t('labels.title') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 v-model="record.title"
                 :class="{ 'is-invalid': errors.title }"
                 placeholder="Title" />
          <div v-if="errors.title"
               class="invalid-feedback">{{ errors.title.join(', ') }}</div>
        </div>

        <!-- region -->
        <div class="row">
          <div class="col-sm-3 col-md-3">
            <div class="form-group">
              <label>{{ $t('labels.region') }}</label>
              <select class="form-control custom-select"
                      v-model="record.region">
                <option v-for="(option, key) in regions"
                        :key="key"
                        :value="key">{{ option }}</option>
              </select>
            </div>
          </div>

          <div class="col-sm-9 col-md-9">
            <div class="form-group">
              <label>{{ $t('labels.address') }}</label>
              <input type="text"
                      class="form-control"
                      v-model="record.address"
                      :class="{ 'is-invalid': errors.address }"
                      placeholder="Address" />
              <div v-if="errors.address"
                    class="invalid-feedback">{{ errors.address.join(', ') }}</div>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-12 col-md-12">
            <div class="form-group">
              <label>{{ $t('labels.level') }}</label>
              <select class="form-control custom-select"
                      v-model="record.type">
                <option v-for="(option, key) in types"
                        :key="key"
                        :value="key">{{ option }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Community -->

        <!--
        <div class="form-group">
          <label>{{ $t('labels.community') }}</label>
          <input type="text"
                  class="form-control"
                  v-model="record.community"
                  :class="{ 'is-invalid': errors.community }"
                  placeholder="Title" />
          <div v-if="errors.community"
                class="invalid-feedback">{{ errors.community.join(', ') }}</div>
        </div>
        -->

        <!-- email -->
        <div class="form-group">
          <label>{{ $t('labels.email') }} <span class="required">*</span></label>
          <input type="text"
                 class="form-control"
                 v-model="record.email"
                 :class="{ 'is-invalid': errors.email }"
                 placeholder="Title" />
          <div v-if="errors.email"
               class="invalid-feedback">{{ errors.email.join(', ') }}</div>
        </div>

        <!-- site -->
        <div class="form-group">
          <label>{{ $t('labels.site') }}</label>
          <input type="text"
                 class="form-control"
                 v-model="record.site"
                 :class="{ 'is-invalid': errors.site }"
                 placeholder="Title" />
          <div v-if="errors.site"
               class="invalid-feedback">{{ errors.site.join(', ') }}</div>
        </div>

        <!-- phone -->
        <div class="row">
          <div class="col-6" v-for="(item, index) in record.phones" :key="index">

            <div class="form-group">
              <label class="form-label">{{ $t('labels.phone') }} <span class="required">*</span></label>
              <div class="row gutters-xs">
                <div class="col">
                  <input type="text"
                    class="form-control"
                    v-model="item.phone"
                    :class="{ 'is-invalid': errors[`phones.${index}.phone`] }"
                    placeholder="Phone" />
                  
                  <div v-if="errors[`phones.${index}.phone`]"
                    class="invalid-feedback">{{ errors[`phones.${index}.phone`].join(', ') }}</div>
                </div>
                <span class="col-auto" v-if="record.phones.length > 1">
                  <button @click="removePhone(item, index)" class="btn btn-danger" type="button">{{ $t('actions.remove') }}</button>
                </span>
              </div>
            </div>

          </div>
        </div>

        <div class="row">
          <div class="col-sm-6 col-md-6">
            <!-- approved -->
            <div class="form-group">
              <div class="form-label">{{ $t('labels.approved') }}</div>
              <div class="custom-switches-stacked">
                <label class="custom-switch">
                  <input type="checkbox"
                         name="approved"
                         v-model="record.approved"
                         value="1"
                         class="custom-switch-input">
                  <span class="custom-switch-indicator"></span>
                  <span class="custom-switch-description" v-if="record.approved">{{ $t('labels.enable') }}</span>
                  <span class="custom-switch-description" v-if="!record.approved">{{ $t('labels.disable') }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="col-sm-6 col-md-6">
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
          </div>

        </div>

        <div class="row" v-if="image">
          <div class="col">
            <div class="form-group">
              <img :src="image" class="img-thumbnail" alt="" style="max-width: 200px;" />
            </div>
          </div>
        </div>

        <div class="row" v-if="record.location && !image">
          <div class="col">
            <div class="form-group">
              <img :src="record.location" class="img-thumbnail" alt="" style="max-width: 200px;" />
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col">
            <div class="form-group">
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

        <!-- map -->
        <div class="row">
          <div class="col-sm-5 col-md-5">
            <div class="form-group">
              <label class="form-label">{{ $t('labels.latitude') }}</label>
              <input type="text"
                     class="form-control"
                     v-bind:placeholder="$t('labels.latitude')"
                     v-model="record.latitude">
            </div>
          </div>

          <div class="col-sm-5 col-md-5">
            <div class="form-group">
              <label class="form-label">{{ $t('labels.longitude') }}</label>
              <input type="text"
                     class="form-control"
                     v-bind:placeholder="$t('labels.longitude')"
                     v-model="record.longitude">
            </div>
          </div>

          <div class="col d-flex align-items-end">
            <div class="form-group">
              <button class="btn btn-secondary" 
                type="button" 
                @click="updatePosition()"><i class="fe fe-search"></i></button>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-sm-12 col-md-12">
            <GmapMap :center="position"
                     :zoom="11"
                     map-type-id="terrain"
                     @click="setPosition"
                     style="width: 100%; height: 300px">
              <GmapMarker :position="position"
                          :clickable="true"
                          :draggable="true"
                          @dragend="setPosition"
                          @click="center=position" />
            </GmapMap>
          </div>
        </div>

      </form>

      <template slot="footer">

        <button class="btn btn-outline-primary"
                  :disabled="loading"
                  @click="newPhone()">{{ $t('actions.add-phone') }}</button>

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
        title: "",
        // community: "",
        email: "",
        site: "",
        region: 0,
        address: '',
        type: 0,
        published: false,
        approved: false,
        latitude: 50.40593976760259,
        longitude: 30.658034999999927,
        phones: []
      },
      loading: false,
      search: {
        title: ""
      },
      types: [],
      regions: [],
      position: {
        lat: 49.23800899780855,
        lng: 30.920982500000036
      },
      image: null,
      file: null,
    };
  },

  computed: {
    // position: function() {
    //   return {
    //     lat: this.record.latitude,
    //     lng: this.record.longitude
    //   };
    // }
  },

  created() {
    this.getList();
    this.getRegions();
    this.getTypes();
  },

  methods: {

    getTypes() {
      axios
        .get(`/api/councils/types`)
        .then(response => {
          this.types = response.data;
        })
        .catch(e => {
          if (e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else {
            this.$notify({ group: "app", type: "error", text: e.message });
          }
        });
    },

    getRegions() {
      axios
        .get(`/api/regions/list`)
        .then(response => {
          this.regions = response.data;
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
        .get(`/api/councils`, {
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
        title: item.title,
        email: item.email,
        // community: item.community,
        location: item.location,
        type: item.type,
        site: item.site,
        region: item.region_id,
        address: item.address,
        published: item.published,
        approved: item.approved,
        phones: item.phones,
        latitude: (item.latitude !== null) ? parseFloat(item.latitude) : '',
        longitude: (item.longitude !== null) ? parseFloat(item.longitude) : ''
      };

      this.modal = true;
      this.errors = [];

      this.updatePosition();
    },

    add: function() {
      this.record = {
        title: '',
        // community: '',
        email: '',
        site: '',
        region: 0,
        address: '',
        type: 0,
        published: false,
        approved: false,
        phones: [{
          phone: ''
        }],
        latitude: 50.40593976760259,
        longitude: 30.658034999999927
      };

      this.modal = true;
      this.errors = [];
    },

    create: function() {
      this.loading = true;

      let formData = new FormData();
      formData.append("title", this.record.title);
      formData.append("email", this.record.email);
      formData.append("site", this.record.site);
      formData.append("region", this.record.region);
      formData.append("address", this.record.address);
      formData.append("type", this.record.type);

      if (this.record.latitude) {
        formData.append("latitude", this.record.latitude);
      }

      if (this.record.longitude) {
        formData.append("longitude", this.record.longitude);
      }

      formData.append("published", parseInt(this.record.published));
      formData.append("approved", parseInt(this.record.approved));
      formData.append("image", this.file);

      for (var i = 0; i < this.record.phones.length; i++) {
        formData.append(`phones[${i}][phone]`, this.record.phones[i].phone);
      }

      axios
        .post("/api/councils", formData)
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
        .put(`/api/councils/${this.record.id}`, this.record)
        .then(response => {
          let i = this.list.data.map(item => item.id).indexOf(response.data.id);
          this.list.data.splice(i, 1, response.data);
          
          if (this.file) {
            let formData = new FormData();
            formData.append("image", this.file);

            axios
              .post(`/api/councils/${this.record.id}/upload`, formData)
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

    show: function(record) {
      axios
        .put(`/api/councils/${record.id}`, { published: !record.published })
        .then(response => {
          record.published = !record.published;
        })
        .catch(e =>
          this.$notify({ group: "app", type: "error", text: e.message })
        );
    },

    approve: function(record) {
      axios
        .put(`/api/councils/${record.id}`, { approved: !record.approved })
        .then(response => {
          record.approved = !record.approved;
        })
        .catch(e => {
          
          if (e.response && e.response.status === 422) {
            this.errors = e.response.data.errors;
          } else if (e.response && e.response.data.error) {
            this.$notify({ group: "app", type: "error", text: e.response.data.error });
          } else {
            this.$notify({ group: "app", type: "error", text: e.response });
          }
        });
    },

    remove: function(item, index) {
      axios
        .delete(`/api/councils/${item.id}`)
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

    setPosition(location) {
      this.record.latitude = location.latLng.lat();
      this.record.longitude = location.latLng.lng();
    },

    updatePosition() {
      this.position = {
        lat: parseFloat(this.record.latitude),
        lng: parseFloat(this.record.longitude)
      }
    },

    // TODO: Remove from DB
    removePhone(item, index) {
      this.record.phones.splice(index, 1);
    },

    newPhone() {
      this.record.phones.push({
        phone: ''
      });
    },

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
