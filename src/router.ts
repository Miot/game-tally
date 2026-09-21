import { createRouter, createWebHashHistory } from 'vue-router'

/** hash 路由：GitHub Pages 项目站点无需 404 回退页即可深链到房间 */
export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    {
      path: '/r/:code',
      name: 'room',
      component: () => import('./views/RoomView.vue'),
      props: true,
    },
    { path: '/settings', name: 'settings', component: () => import('./views/SettingsView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})
