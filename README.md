# MangaStore — uma vitrine Vue 3 que amadurece do `fetch` na página à camada de serviço, à autenticação e aos componentes reutilizáveis

Projeto didático da disciplina de Desenvolvimento Web (QXD0279). É uma _single-page
application_ em **Vue 3 + Vite + TypeScript** que consome uma API REST (um back-end
[Strapi](https://strapi.io/) rodando em `http://localhost:1337`) para listar mangás,
mostrar os detalhes de cada um e, mais adiante, autenticar usuários e proteger uma
área administrativa.

---

## 🏗️ Evolução da Arquitetura

Partimos de componentes que chamam `fetch` diretamente e montam a URL na mão;
chegamos a uma aplicação com camada de acesso a dados isolada, tratamento de
carregamento/erro/404, componentes de UI reaproveitáveis dirigidos por rota,
estado global com Pinia e um fluxo de autenticação que sobrevive a um F5 e
resiste a alguém editar o `localStorage` na mão.

### 1. Ponto de partida: uma SPA roteada com Vue 3 + Vite + TypeScript

O primeiro commit já traz o esqueleto: componentes em `<script setup>`, tipagem do
domínio em `src/types/index.ts` e o **Vue Router** ligado no `main.ts`. As rotas
são estáticas e a página busca os dados por conta própria.

```ts
// src/router/index.ts — as duas telas, sem parâmetros
const routes = [
  { path: '/', component: Home },
  { path: '/detail', component: MangaDetail },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
```

```vue
<!-- src/pages/Home.vue — a própria página faz o fetch e conhece a URL da API -->
<script setup lang="ts">
const mangas = ref<Manga[]>([])

onBeforeMount(async () => loadMangas())

async function loadMangas() {
  try {
    const response = await fetch('http://localhost:1337/api/mangas?populate=cover')
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`)
    }
    const result = await response.json()
    mangas.value = result.data
  } catch (error) {
    console.error(error.message)
  }
}
</script>
```

```vue
<!-- src/components/MangaCard.vue — a URL do servidor de imagens também está no componente -->
<script setup lang="ts">
const props = defineProps<Manga>()
const coverUrl = computed(() => `http://localhost:1337${props.cover.url}`)
</script>
```

**Por que começar assim?**

- `<script setup>` + `defineProps<Manga>()` dá tipagem de props sem `defineComponent`
  nem `props: { ... }` — o tipo do domínio é a única fonte de verdade.
- `createWebHistory()` em vez de `createWebHashHistory()`: URLs limpas (`/manga/1`
  em vez de `/#/manga/1`), ao custo de precisar de _fallback_ para `index.html` no
  servidor de produção — aceitável para uma aplicação de estudo.
- O `fetch` na página **funciona**, mas já expõe o problema: a URL base
  `http://localhost:1337` aparece em `Home.vue`, em `MangaDetail.vue` e em
  `MangaCard.vue`. Trocar de ambiente exigiria caçar a string em três arquivos.

### 2. Uma camada de serviço para a API e a rota dinâmica `/manga/:id`

O `fetch` sai dos componentes e vai para `src/api/`. `index.ts` concentra a URL
base; `MangaService.ts` expõe métodos de domínio (`findAll`, `findById`) e esconde
o envelope `{ data }` que o Strapi devolve. A rota de detalhe passa a receber o
`id` como parâmetro.

```ts
// src/api/index.ts — o único lugar que conhece o endereço do back-end
const BASE_URL = 'http://localhost:1337/api'
const UPLOAD_URL = 'http://localhost:1337'

export const useUpload = (path: string) => `${UPLOAD_URL}${path}`
export const useFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(`${BASE_URL}${input}`, init)
```

```ts
// src/api/MangaService.ts — método genérico + API de domínio
type StrapiResponse<T> = { data: T }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await useFetch(path, init)
  if (!response.ok) {
    throw new Error(`Response status: ${response.status}`)
  }
  const result: StrapiResponse<T> = await response.json()
  return result.data
}

export const MangaService = {
  findAll: () => request<Manga[]>('/mangas?populate=cover'),
  findById: (id: number | string) => request<Manga>(`/mangas/${id}?populate=cover`),
}
```

```ts
// src/router/index.ts — rota nomeada com parâmetro dinâmico
{ path: '/manga/:id', name: 'manga-detail', component: MangaDetail },
```

```vue
<!-- src/pages/MangaDetail.vue — lê o parâmetro da rota, não recebe mais props -->
<script setup lang="ts">
const route = useRoute()
const manga = ref<Manga | null>(null)

onBeforeMount(async () => (manga.value = await MangaService.findById(route.params.id as string)))
</script>
```

**Por que uma camada de serviço em vez de `fetch` na página?**

- **Uma mudança, um arquivo.** A URL base agora vive só em `api/index.ts`.
- **O componente fala a língua do domínio.** `MangaService.findById(id)` diz o que
  se quer; `fetch('.../mangas/1?populate=cover')` diz como se consegue. O template
  não precisa saber que existe um parâmetro `populate` nem um envelope `{ data }`.
- **`request<T>` genérico** centraliza o `response.ok` e o `.json()`: cada método
  novo é uma linha, não uma repetição do mesmo `try/if/throw`.
- A rota dinâmica `:id` com `useRoute()` substitui a navegação por props: agora a
  URL `/manga/5` é compartilhável e recarregável — o estado está no endereço, não
  na memória do componente pai.

> Neste estágio o layout do `MangaDetail` também vira um _card_ horizontal
> (`row g-0` + `col-md-4` / `col-md-8` do Bootstrap), preparando espaço para os
> controles de navegação que chegam no estágio 5.

### 3. A casca da aplicação: `App.vue`, `<RouterView>` e o `NavBar`

Até aqui o `index.html` carregava um layout inteiro (herdado do exemplo _Album_ do
Bootstrap). Esse conteúdo migra para dentro do Vue: `App.vue` passa a ser a moldura
fixa — cabeçalho, `<main>` e rodapé — com `<RouterView />` no lugar onde a página
atual entra.

```vue
<!-- src/App.vue — a moldura que não muda entre rotas -->
<script setup lang="ts">
import { RouterView } from 'vue-router'
import NavBar from '@/components/NavBar.vue'
</script>

<template>
  <NavBar />
  <main>
    <div class="album py-5 bg-body-tertiary">
      <div class="container">
        <RouterView />
      </div>
    </div>
  </main>
  <footer class="text-body-secondary py-5">...</footer>
</template>
```

```vue
<!-- src/components/NavBar.vue — navegação por RouterLink, não por <a href> -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink to="/" class="navbar-brand d-flex align-items-center">
    <strong>MangaStore</strong>
  </RouterLink>
</template>
```

**Por que trazer o layout para o `App.vue`?**

- O que é **estrutura da aplicação** (barra de navegação, rodapé) pertence a um
  componente Vue, não ao HTML estático — assim pode reagir a estado, receber
  props e ser testado. O `index.html` volta a ser só o ponto de montagem.
- `<RouterLink to="/">` em vez de `<a href="/">`: a troca de rota acontece no
  cliente, sem recarregar a página, e o link ganha classe de "ativo"
  automaticamente.
- Separar `NavBar` em componente próprio evita que `App.vue` cresça sem controle e
  deixa a moldura legível de relance.

### 4. Estados de carregamento e erro + rota curinga 404

Buscar dados leva tempo e pode falhar. As páginas passam a expor três estados
explícitos — `loading`, `error`, conteúdo — em vez de mostrar a tela vazia
enquanto a `Promise` não resolve. E o roteador ganha uma rota _catch-all_ para
qualquer caminho inexistente.

```vue
<!-- src/pages/MangaDetail.vue — o try/catch/finally comanda os três refs -->
<script setup lang="ts">
const manga = ref<Manga | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

onBeforeMount(async () => {
  try {
    manga.value = await MangaService.findById(route.params.id as string)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <LoadingSpinner v-if="loading" label="Carregando detalhes do mangá…" />
  <Alert v-else-if="error" :message="error" />
  <div v-else-if="manga" class="card shadow-sm mb-3">...</div>
</template>
```

```ts
// src/router/index.ts — a última rota casa com tudo que não casou antes
{ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
```

```ts
// src/api/MangaService.ts — um 404 da API redireciona para a página NotFound
if (!response.ok) {
  if (response.status === 404) {
    await router.replace('/notFound')
  }
  throw new Error(`Response status: ${response.status}`)
}
```

**Por que estados explícitos e uma rota curinga?**

- `v-if="loading" / v-else-if="error" / v-else-if="manga"` torna **impossível**
  renderizar o conteúdo antes da hora ou esquecer de tratar a falha — o template
  cobre os três casos ou não compila a intenção.
- `finally` zera `loading` uma única vez, tenha a busca dado certo ou não; sem ele,
  o _spinner_ ficaria eterno em caso de erro.
- `/:pathMatch(.*)*` precisa ser a **última** rota: o Vue Router testa na ordem, e
  esse padrão casa com qualquer coisa. Sem ela, uma URL errada renderiza nada.
- `router.replace` (e não `push`) na resposta 404: a página inexistente não deve
  ficar no histórico do navegador, senão o botão "voltar" cai de volta nela.

### 5. Navegação entre mangás com `onBeforeRouteUpdate`

Na página de detalhe, botões "Anterior" / "Próximo" levam de `/manga/3` para
`/manga/4`. O problema: como o componente é o mesmo, o Vue Router **reaproveita a
instância** e o `onBeforeMount` não dispara de novo. É preciso um gancho que
reaja à mudança de parâmetro.

```vue
<!-- src/pages/MangaDetail.vue -->
<script setup lang="ts">
onBeforeMount(async () => {
  try {
    manga.value = await MangaService.findById(route.params.id as string)
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id !== from.params.id) {
    try {
      manga.value = await MangaService.findById(to.params.id as string)
    } catch (e) {
      error.value = (e as Error).message
    } finally {
      loading.value = false
    }
  }
})
</script>

<template>
  <nav class="position-absolute bottom-0 end-0 m-2">
    <button class="btn btn-outline-secondary mx-1">
      <router-link :to="`/manga/${manga.id - 1}`">Anterior</router-link>
    </button>
    <button class="btn btn-outline-secondary">
      <router-link :to="`/manga/${manga.id + 1}`">Próximo</router-link>
    </button>
  </nav>
</template>
```

**Por que `onBeforeRouteUpdate` e não confiar no `onBeforeMount`?**

- Quando só o parâmetro dinâmico muda e o componente-alvo é o mesmo, **não há
  desmontagem nem montagem** — os ganchos de ciclo de vida não rodam. `mounted`
  só serve para a primeira carga.
- O `if (to.params.id !== from.params.id)` evita recarregar à toa quando muda
  apenas a _query string_ ou o _hash_ da mesma rota.
- Alternativa possível seria um `watch(() => route.params.id, ...)`; o gancho de
  rota é mais explícito sobre a intenção ("quando esta rota for atualizada") e
  ainda permite cancelar a navegação retornando `false`.

### 6. Paginação: da lógica na página ao componente `PaginationContainer`

O catálogo cresceu e não cabe numa tela. Primeiro a paginação nasce toda dentro de
`Home.vue`: o serviço passa a mandar `pagination[page]` e a devolver o `meta`, e o
template ganha uma barra de botões que faz `router.push('/?page=N')`. Depois, essa
barra — grande e repetida no topo e no rodapé — é extraída para um componente.

```ts
// src/api/MangaService.ts — o serviço aceita a página e devolve o envelope inteiro
export type MetaInformation = {
  pagination: { page: number; pageSize: number; pageCount: number; total: number }
}
type StrapiResponse<T> = { data: T; meta: MetaInformation }

async function request<T>(path: string, init?: RequestInit): Promise<StrapiResponse<T>> {
  // ...
  return response.json()
}

export const MangaService = {
  findAll: (page: number | string = 1) =>
    request<Manga[]>(`/mangas?populate=cover&pagination[page]=${page}&pagination[pageSize]=24`),
  findById: (id: number | string) => request<Manga>(`/mangas/${id}?populate=cover`),
}
```

```vue
<!-- src/pages/Home.vue — a página lê ?page= da URL e recarrega quando ela muda -->
<script setup lang="ts">
const meta = ref<MetaInformation>({} as MetaInformation)

async function loadMangas(page = 1) {
  try {
    const result = await MangaService.findAll(page)
    mangas.value = result.data
    meta.value = result.meta
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

onBeforeMount(async () => await loadMangas(Number(route.query.page)))
onBeforeRouteUpdate(async (to, from) => {
  if (to.query.page != from.query.page) {
    await loadMangas(Number(to.query.page))
  }
})
</script>
```

Refatoração — a barra vira `PaginationContainer.vue`, recebendo `meta` por props:

```vue
<!-- src/components/PaginationContainer.vue -->
<script setup lang="ts">
import type { MetaInformation } from '@/api/MangaService'
const router = useRouter()
const props = defineProps<MetaInformation>()
</script>

<template>
  <button :disabled="props.pagination.page == 1" @click="router.push('/?page=1')">Primeira</button>
  <button
    v-for="i in props.pagination?.pageCount"
    :key="i"
    :class="[i == props.pagination.page ? 'btn-secondary' : 'btn-outline-secondary']"
    @click="router.push(`/?page=${i}`)"
  >
    {{ i }}
  </button>
  <!-- Anterior / Próximo / Última seguem o mesmo padrão -->
</template>
```

```vue
<!-- src/pages/Home.vue — a mesma barra no topo e no rodapé, sem duplicar código -->
<template>
  <PaginationContainer class="mb-3 d-flex justify-content-center" v-bind="meta" />
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
    <MangaCard v-for="manga of mangas" :key="manga.id" v-bind="manga" />
  </div>
  <PaginationContainer class="mt-3 d-flex justify-content-center" v-bind="meta" />
</template>
```

**Por que guardar a página na _query string_ e depois extrair o componente?**

- `?page=3` na URL, lido com `route.query.page`, mantém a página atual
  **compartilhável e recarregável** — mesma lição da rota `:id` do estágio 2,
  aplicada a um filtro em vez de um recurso.
- `onBeforeRouteUpdate` observando `to.query.page`: navegar entre páginas é trocar
  a _query_ da mesma rota, então de novo os ganchos de ciclo de vida não bastam.
- **Extrair só depois de doer.** A barra foi escrita inteira em `Home.vue`
  primeiro; quando precisou aparecer duas vezes (topo e rodapé), a duplicação
  justificou o componente. `defineProps<MetaInformation>()` reaproveita o tipo já
  existente do serviço, e `v-bind="meta"` espalha o objeto como props sem listar
  campo por campo.
- O componente ainda faz `router.push` internamente — ele conhece a rota `/`. Um
  passo natural seguinte seria emitir um evento `@change="page => ..."` e deixar a
  página decidir para onde navegar, tornando-o realmente genérico.

### 7. Estado global com Pinia

Antes de existir qualquer store, o Pinia entra sozinho: a dependência é instalada
e conectada ao `app` em `main.ts`. Nenhuma lógica de autenticação chega junto —
esse commit só garante que a fundação está de pé.

```ts
// src/main.ts — Pinia plugado, ainda sem nenhuma store
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.mount('#app')
```

**Por que uma etapa só para isso?**

- Separar "instalar a ferramenta" de "usar a ferramenta" deixa o próximo commit
  livre para ser só sobre a store — se algo quebrar, o culpado é óbvio.
- É a mesma lição do estágio 2: cada mudança de infraestrutura vem antes do
  código que depende dela, nunca junto.

### 8. Autenticação com Pinia: login, store e guard inicial

O catálogo era só de leitura; agora existe login, cadastro e uma área
administrativa (`/admin`) que só deveria abrir para quem tem a role certa. A
store de autenticação usa a API de _setup stores_ do Pinia (uma função, não um
objeto de opções) e o `Login.vue` decide para onde navegar de acordo com o
`role` devolvido pela API.

```ts
// src/stores/authStore.ts — primeira versão: sem persistência, sem revalidação
export const useAuthStore = defineStore('authStore', () => {
  const username = ref<string | undefined>()
  const jwt = ref<string | undefined>()
  const role = ref<string | undefined>()

  const isAdmin = computed(() => role.value == 'admin')

  async function authenticate(identifier: string, password: string) {
    const result = await AuthenticationService.login(identifier, password)

    username.value = result.user.username
    jwt.value = result.jwt
    role.value = result.user.role?.type
  }

  function logout() {}

  return { username, isAdmin, authenticate, logout }
})
```

```ts
// src/router/index.ts — a rota carrega um sinalizador; um guard global lê esse sinalizador
{
  path: '/admin',
  component: HomeAdmin,
  meta: { requiresAuth: true },
},

router.beforeEach((to, from) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAdmin) {
    return '/login'
  }
})
```

**Por que `defineStore` com função em vez de objeto de opções?**

- A sintaxe de função espelha um `<script setup>`: `ref` vira estado, `computed`
  vira _getter_, função declarada vira _action_ — quem já lê componentes Vue 3
  já sabe ler a store.
- `meta: { requiresAuth: true }` + **um único** `router.beforeEach` é o padrão
  certo para proteger rotas: a regra de acesso mora no roteador, não espalhada
  em `onBeforeMount` de cada página que precisar dela.
- Ponto em aberto que o próprio autor deixou visível: `isAdmin` só olha o `role`
  guardado em memória. Se alguém editar o `localStorage` manualmente e recarregar
  a página, esse estado se perde mesmo — mas o gancho para revalidar contra o
  servidor ainda não existe. É o problema que o estágio 9 resolve.

### 9. Fechando a brecha: persistência local e revalidação da sessão no servidor

Duas lacunas apareceram em sequência: (1) um F5 apagava a sessão, porque nada
lia o `localStorage` na inicialização; (2) mesmo depois de persistir, nada
impedia alguém de abrir o DevTools e trocar `role` para `"admin"` a mão. As
correções vêm juntas nesta etapa porque a segunda só faz sentido depois da
primeira existir.

```ts
// src/stores/authStore.ts — estado inicial lido do localStorage, e revalidado no servidor
const ADMIN_ROLE = 'admin'

export const useAuthStore = defineStore('authStore', () => {
  const username = ref<string | null>(localStorage.getItem('username'))
  const jwt = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const role = ref<string | null>(localStorage.getItem('role'))

  const isAdmin = computed(() => role.value === ADMIN_ROLE)

  async function fetchMe() {
    if (!jwt.value) return

    try {
      const user = await AuthenticationService.me(jwt.value)
      username.value = user.username
      role.value = user.role?.type || null
      persistState()
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        logout()
      }
    }
  }

  function save(key: string, value: string | null) {
    if (value) {
      localStorage.setItem(key, value)
    } else {
      localStorage.removeItem(key)
    }
  }

  function persistState() {
    save('username', username.value)
    save(TOKEN_KEY, jwt.value)
    save('role', role.value)
  }

  function logout() {
    username.value = null
    jwt.value = null
    role.value = null

    localStorage.removeItem('username')
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('role')
  }

  return { username, isAdmin, authenticate, fetchMe, logout }
})
```

```ts
// src/router/index.ts — o guard busca o usuário atual antes de decidir
router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    await authStore.fetchMe()

    if (!authStore.isAdmin) {
      return { name: 'login' }
    }
  }
})
```

**Por que essa ordem de correções, e não revalidar direto?**

- `ref(localStorage.getItem(...))` como valor **inicial** resolve o F5: o estado
  reaparece antes mesmo da store terminar de ser criada, sem precisar de um
  `onMounted` explícito em lugar nenhum.
- `fetchMe()` chamado dentro do próprio `beforeEach`, antes do `if (!isAdmin)`,
  fecha a brecha: o `role` usado na decisão de acesso agora vem de uma chamada
  fresca ao back-end, não do que está gravado no navegador. Editar o
  `localStorage` na mão deixa de ter efeito.
- `ApiError` (com `status` tipado) substitui `Error` genérico só onde importa:
  `fetchMe` precisa distinguir "token inválido" (401/403 → deslogar) de qualquer
  outra falha de rede, e um `Error` comum não carrega essa informação.
- `logout()` trocou `localStorage.clear()` por três `removeItem` nominais — um
  detalhe pequeno, mas `clear()` apagaria **qualquer** outra coisa que a
  aplicação viesse a guardar no mesmo domínio, não só as chaves da sessão.
- A função `save(key, value)` existe só para não repetir
  `value ? setItem : removeItem` três vezes — e de quebra elimina o
  `value!!` (um `!` bastaria; o duplo é um hábito de outra linguagem que não
  muda o comportamento em TypeScript, só confunde).
- `src/router/route-meta.d.ts` amplia `RouteMeta` do próprio `vue-router` via
  _module augmentation_: `to.meta.requiresAuth` passa a ser `boolean | undefined`
  tipado, em vez de `any` implícito.

### 10. Um único helper de requisição para toda a API

`AuthenticationService.ts` tinha nascido com sua **própria** função `request<T>`,
quase idêntica à do `MangaService.ts` — mesma forma, `fetch` + `response.json()`
+ checagem de `response.ok`, mas duas cópias. `src/api/index.ts` passa a
concentrar essa lógica, com uma opção para anexar o token de autenticação.

```ts
// src/api/index.ts — um request<T> para MangaService e AuthenticationService
export const TOKEN_KEY = 'token'

type RequestOptions = RequestInit & { auth?: boolean }

export async function request<T>(
  path: string,
  { auth = false, ...init }: RequestOptions = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  const token = localStorage.getItem(TOKEN_KEY)

  if (auth && token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const fallback = `Response status: ${response.status}`
    const message = response.status === 400 ? (body?.error?.message ?? fallback) : fallback
    throw new ApiError(response.status, message)
  }

  return body
}
```

```ts
// src/api/MangaService.ts — mesma função, importada em vez de reescrita
export const MangaService = {
  findAll: (page: number | string = 1) =>
    request<StrapiResponse<Manga[]>>(
      `/mangas?populate=cover&pagination[page]=${page}&pagination[pageSize]=24`,
    ),
  findById: (id: number | string) => request<StrapiResponse<Manga>>(`/mangas/${id}?populate=cover`),
}
```

**Por que unificar só agora, e não desde o início?**

- A duplicação só ficou visível **depois** que o segundo serviço existiu — exatamente
  a mesma lição do estágio 6 sobre extrair componente: generalizar antes de haver
  dois usos reais é chute, não design.
- O `MangaService` tinha uma responsabilidade que não era dele: redirecionar para
  `/notFound` em um 404, dentro do próprio `request<T>`. Isso saiu do helper
  genérico e virou uma checagem `e instanceof ApiError && e.status === 404` em
  `MangaDetail.vue` — a camada de transporte deixa de conhecer rotas.
- A opção `auth?: boolean` (em vez de exigir o header manualmente em cada
  chamada) mantém a assinatura de `findAll`/`findById`/`me` igual à de antes;
  só quem precisa de token pede por ele.
- Os tipos `User`/`Role`, que `AuthenticationService.ts` declarava por conta
  própria, migraram para `src/types/index.ts` junto de `Manga` — um único lugar
  para o vocabulário do domínio, e não um por serviço.

### 11. Navegação por nome de rota e o redirecionamento pós-login seguro

Até aqui, toda navegação programática usava caminhos escritos à mão
(`router.push('/admin')`, `` router.push(`/manga/${id}`) ``) — um `path` que
mudasse quebraria silenciosamente todo lugar que o repetisse. A troca é para
rotas nomeadas, e isso abre espaço para uma última peça: depois de um redirect
para `/login`, o usuário deveria voltar para onde estava indo, não sempre para
a home.

```ts
// src/router/index.ts — toda rota que participa da navegação programática ganha um name
{ path: '/admin', name: 'admin', component: HomeAdmin, meta: { requiresAuth: true } },
{ path: '/notFound', name: 'not-found', component: NotFound },
{ path: '/:pathMatch(.*)*', name: 'catch-all', component: NotFound },

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    await authStore.fetchMe()

    if (!authStore.isAdmin) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
})
```

```ts
// src/pages/Login.vue — lê o destino da query com cuidado antes de confiar nele
function destination(): RouteLocationRaw {
  const redirect = route.query.redirect

  if (typeof redirect === 'string' && /^\/(?![/\\])/.test(redirect)) {
    const { meta } = router.resolve(redirect)
    if (!meta.requiresAuth || authStore.isAdmin) {
      return redirect
    }
  }

  return { name: authStore.isAdmin ? 'admin' : 'home' }
}

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await authStore.authenticate(identifier.value, password.value)
    router.push(destination())
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}
```

**Por que trocar `path` por `name`, e por que a validação em `destination()`?**

- `router.push({ name: 'manga-detail', params: { id } })` não quebra se o
  `path` da rota mudar um dia; `` router.push(`/manga/${id}`) `` quebra. Nomear
  a rota uma vez no `router/index.ts` e navegar por esse nome em todo lugar é
  o mesmo princípio do estágio 2 aplicado à navegação: um único lugar conhece o
  formato real da URL.
- O guard grava `to.fullPath` na query (`?redirect=/admin`) só quando barra o
  acesso — é a mesma URL que o usuário já tentava abrir, sem precisar
  recalculá-la depois do login.
- `destination()` **não** confia cegamente nesse `redirect`: o regex
  `/^\/(?![/\\])/` aceita só caminhos internos (`/admin`) e rejeita algo como
  `//evil.com` ou `\\evil.com` — sem essa checagem, a query de redirect vira
  uma porta para um _open redirect_ (mandar o usuário autenticado para fora do
  site logo após o login).
- Mesmo passando na checagem de formato, o destino só é aceito se
  `!meta.requiresAuth || authStore.isAdmin`: sem essa segunda trava, um usuário
  comum barrado em `/admin` seria devolvido para `/admin` de novo assim que
  logasse — criando um loop, já que ele nunca deixa de ser um usuário comum.

---

## 🛠️ Tecnologias Utilizadas

- **Vue 3 (`<script setup>`):** framework de UI. Toda a tipagem de props vem de
  `defineProps<T>()` sobre os tipos do domínio.
- **Vue Router 4:** roteamento no cliente. Rotas nomeadas, parâmetro dinâmico
  `:id`, rota curinga 404, o gancho `onBeforeRouteUpdate` e um guard global
  (`router.beforeEach`) que protege `/admin` por `meta.requiresAuth`.
- **Pinia:** estado global via _setup store_ (`useAuthStore`), com o estado de
  autenticação persistido em `localStorage` e revalidado no servidor a cada
  navegação para uma rota protegida.
- **TypeScript:** os tipos `Manga`/`User`/`Role` e os envelopes `StrapiResponse<T>` /
  `MetaInformation` são o contrato entre a API e os componentes; `route-meta.d.ts`
  estende os tipos do próprio Vue Router para `meta.requiresAuth`.
- **Vite:** _dev server_ com HMR e _build_ de produção. Alias `@` → `src/`.
- **Bootstrap 5.3 (via CDN, em `index.html`):** classes utilitárias de layout;
  nenhum componente JS do Bootstrap é usado.
- **Strapi (back-end externo):** API REST em `http://localhost:1337`. Não faz
  parte deste repositório — precisa estar rodando à parte.
- **ESLint + oxlint + Prettier:** padronização e checagem estática.

## ▶️ Como executar

Pré-requisitos: **Node.js `^22.18.0` ou `>=24.12.0`** e uma instância do Strapi
respondendo em `http://localhost:1337` com o _content-type_ `manga` (campos
`title`, `summary`, `price`, `number` e a relação `cover`) e o plugin
_Users & Permissions_ habilitado. Para testar a área `/admin`, o usuário
autenticado precisa ter a role `admin` no Strapi.

```sh
git clone <url-do-repositorio>
cd MangaStore
npm install
npm run dev
```

Outros scripts:

```sh
npm run build        # type-check + build de produção
npm run lint         # oxlint + eslint com --fix
npm run format       # prettier em src/
```

## 📖 Como usar este repositório para estudo

- **Percorra os commits na ordem** (`git log --reverse`). Cada um resolve o
  problema que o anterior deixou; o _diff_ é a aula.
- **Compare `Home.vue` no estágio 1 e no estágio 6.** Veja o `fetch` cru virar
  `MangaService.findAll(page)`, e a página ganhar `loading`/`error`/`meta` sem
  inchar o template.
- **Estude a fronteira `src/api/`.** Pergunte-se, a cada método do componente, se
  ele fala de _domínio_ ("buscar mangá 5") ou de _transporte_ ("GET nessa URL com
  esse header"). O segundo não deveria estar num `.vue`.
- **Observe quando os ganchos de ciclo de vida não bastam.** Nos estágios 5 e 6, a
  navegação reusa a instância do componente; entenda por que `onBeforeMount` não
  dispara e o que `onBeforeRouteUpdate` faz no lugar.
- **Repare no momento da extração de componente** (estágio 6): o código só virou
  `PaginationContainer` depois de precisar existir em dois lugares. Extrair antes
  disso seria abstração sem uso.
- **Compare `authStore.ts` no estágio 8 e no estágio 9.** A primeira versão
  confia inteiramente no que está em memória; a segunda lê do `localStorage` na
  inicialização e revalida contra o servidor a cada rota protegida. Pergunte-se
  o que um usuário malicioso conseguiria fazer só com a versão do estágio 8.
- **Repare que a duplicação em `AuthenticationService.ts`/`MangaService.ts` só
  foi unificada no estágio 10** — depois de existir em dois lugares, igual ao
  `PaginationContainer` do estágio 6. É o mesmo princípio se repetindo em duas
  camadas diferentes da aplicação.
- **No estágio 11, entenda por que `destination()` valida o `redirect` da query
  em vez de usá-lo direto.** É um exemplo pequeno e concreto de por que nunca se
  deve confiar em dado vindo da URL sem checagem, mesmo quando parece inofensivo.

---

Desenvolvido por [Bruno Mateus](https://github.com/brunomateus) para fins didáticos.
