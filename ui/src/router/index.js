import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import UserView from "../views/UserView.vue";
import NewUserView from "../views/NewUserView.vue";
import EditUserView from "../views/EditUserView.vue";
import LoginView from "../views/LoginView.vue";
import { useUserStore } from "@/stores/userStore";
import SportlerView from "@/views/SportlerView.vue";
import SportfesteView from "@/views/SportfesteView.vue";
import AnmeldungDreiVierKampf from "@/views/AnmeldungDreiVierKampf.vue";
import StaffelUebersicht from "@/views/StaffelUebersicht.vue";
import EditStaffelView from "@/views/EditStaffelView.vue";
import FilesView from "@/views/FilesView.vue";
import ImpressumDSGVO from "@/views/ImpressumDSGVO.vue";
import ChangePassword from "@/views/ChangePassword.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/impressum",
      name: "impressum",
      component: ImpressumDSGVO,
    },
    {
      path: "/users",
      name: "users",
      component: UserView,
      meta: {
        requiresRole: "admin",
      },
    },
    {
      path: "/changePassword",
      name: "changePassword",
      component: ChangePassword,
      meta: {
        requiresRole: "benutzer"
      },
    },
    {
      path: "/sportler",
      name: "sportler",
      component: SportlerView,
      meta: {
        requiresRole: "benutzer",
      },
    },
    {
      path: "/sportfeste",
      name: "sportfeste",
      component: SportfesteView,
      meta: {
        requiresRole: "admin",
      },
    },
    {
      path: "/sportlerAnmeldung/:sportfestId",
      name: "sportlerAnmeldung",
      component: AnmeldungDreiVierKampf,
      meta: {
        requiresRole: "benutzer",
      },
      props: true
    },
    {
      path: "/staffelUebersicht/:sportfestId",
      name: "staffelUebersicht",
      component: StaffelUebersicht,
      meta: {
        requiresRole: "benutzer",
      },
      props: true
    },
    {
      path: "/editStaffel",
      name: "editStaffel",
      component: EditStaffelView,
      meta: {
        requiresRole: "benutzer",
      },
    },
    {
      path: "/newuser",
      name: "newuser",
      component: NewUserView,
      meta: {
        requiresRole: "admin",
      },
    },
    {
      path: "/edituser",
      name: "edituser",
      component: EditUserView,
      meta: {
        requiresRole: "admin",
      },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/files",
      name: "files",
      component: FilesView,
      meta: {
        requiresRole: "admin",
      },
    }
  ],
});

// diese wartefunktion ist notwendig weil die route vorher aufgerufen wird
// vor die antwort von getSessionData in App.vue fertig ist
async function waitForSessionData(userStore, timeout = 5000) {
  const interval = 100; // Intervall in Millisekunden für die Überprüfung
  let elapsedTime = 0;

  while (elapsedTime < timeout) {
    if (userStore.getSessionDataFinished) {
      return true;
    }
    console.log("warten");
    await new Promise((resolve) => setTimeout(resolve, interval));
    elapsedTime += interval;
  }
  throw new Error("Timeout abgelaufen!");
}

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const requiredRole = to.meta.requiresRole;

  if (requiredRole) {
    // Prüfe, ob der Benutzer eingeloggt ist und die erforderliche Rolle hat
    const userStore = useUserStore();

    await waitForSessionData(userStore);

    if (userStore.hasRole(requiredRole)) {
      next(); // Benutzer hat die richtige Rolle, Route erlauben
    } else {
      next({ name: "home" }); // Umleiten, falls die Rolle nicht passt
    }
  } else {
    next(); // Wenn keine Rolle erforderlich ist, Route erlauben
  }
});

export default router;
