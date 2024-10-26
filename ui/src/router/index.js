import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import UserView from '../views/UserView.vue'
import NewUserView from '../views/NewUserView.vue'
import LoginView from '../views/LoginView.vue'
import { useUserStore } from '@/stores/userStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/users',
      name: 'users',
      component: UserView,
      meta: {
        requiresRole: 'admin'
      }
    },
    {
      path: '/newuser',
      name: 'newuser',
      component: NewUserView,
      meta: {
        requiresRole: 'admin'
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const requiredRole = to.meta.requiresRole;

  if (requiredRole) {
    // Prüfe, ob der Benutzer eingeloggt ist und die erforderliche Rolle hat
    const userStore = useUserStore();

    if (userStore.hasRole(requiredRole)) {
      next(); // Benutzer hat die richtige Rolle, Route erlauben
    } else {
      next({ name: 'home' }); // Umleiten, falls die Rolle nicht passt
    }
  } else {
    next(); // Wenn keine Rolle erforderlich ist, Route erlauben
  }
});

export default router
