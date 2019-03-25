<template>
  <div class="header collapse d-lg-flex p-0" id="headerMenuCollapse">
    <div class="container">
      <div class="row align-items-center">
        
        <div class="col-lg order-lg-first">
          <ul class="nav nav-tabs border-0 flex-column flex-lg-row">

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/users' }">
                <i class="fe fe-user"></i> {{ $t("menu.users") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/councils' }">
                <i class="fe fe-users"></i> {{ $t("menu.councils") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/content' }">
                <i class="fe fe-facebook"></i> {{ $t("menu.content") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/questions' }">
                <i class="fe fe-message-square"></i> {{ $t("menu.questions") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/regions' }">
                <i class="fe fe-map"></i> {{ $t("menu.regions") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/instruction' }">
                <i class="fe fe-clipboard"></i> {{ $t("menu.instructions") }}</router-link>
            </li>

            <li class="nav-item">
              <router-link class="nav-link" active-class="active" :to="{ path: '/admin/files' }">
                <i class="fe fe-save"></i> {{ $t("menu.files") }}</router-link>
            </li>

            <li class="nav-item">
              <a href="/logout" class="nav-link"><i class="fe fe-log-out"></i> {{ $t("menu.logout") }}</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {}
</script>