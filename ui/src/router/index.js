import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/protected',
      name: 'protected',
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresRole: 'admin'  // Hier wird die erforderliche Rolle definiert
      }
    }
  ]
})

// Navigation Guard
router.beforeEach((to, from, next) => {
  const requiredRole = to.meta.requiresRole;

  if (requiredRole) {
    // Prüfe, ob der Benutzer eingeloggt ist und die erforderliche Rolle hat
    const userRole = 'test';

    if (userRole === requiredRole) {
      next(); // Benutzer hat die richtige Rolle, Route erlauben
    } else {
      next({ name: 'home' }); // Umleiten, falls die Rolle nicht passt
    }
  } else {
    next(); // Wenn keine spezielle Rolle erforderlich ist, Route erlauben
  }
});

export default router
