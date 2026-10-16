<script setup>
import { onMounted, onUnmounted, ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

import PixelButton from '@/components/PixelButton.vue'
import CreeperLogo from '@/components/CreeperLogo.vue'
import MinecraftItem from '@/components/MinecraftItem.vue'
import RecipeCard from '@/components/RecipeCard.vue'
import RecipeModal from '@/components/RecipeModal.vue'
import { userApi } from '@/api'
import { clearSession, isLoggedIn } from '@/utils/auth'
import { useToast } from '@/composables/useToast'
import { RECIPES, CATEGORIES, ITEMS } from '@/data/recipes'
import { FEATURES, TIPS, NOTICES, BIO } from '@/data/home'
import { SITE } from '@/constants/site'

const router = useRouter()
const { show } = useToast()

const loading = ref(true)
const error = ref('')
const user = ref(null)
const category = ref('全部')
const query = ref('')
const selected = ref(null)
const codexRef = ref(null)

const itemsList = computed(() => Object.entries(ITEMS))
const recipesCount = RECIPES.length
const itemsCount = itemsList.value.length
const categoriesCount = CATEGORIES.length - 1
const displayCategories = computed(() => [...CATEGORIES, '我的收藏'])

/* ---------- 收藏（localStorage 持久化） ---------- */
const FAV_KEY = 'blockcraft.favorites'
const favorites = ref(new Set())
function loadFavs() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]'))
  } catch {
    return new Set()
  }
}
function toggleFav(r) {
  if (favorites.value.has(r.id)) favorites.value.delete(r.id)
  else favorites.value.add(r.id)
  favorites.value = new Set(favorites.value) // 强制触发响应式
  localStorage.setItem(FAV_KEY, JSON.stringify([...favorites.value]))
}
function isFaved(r) {
  return favorites.value.has(r.id)
}
const favCount = computed(() => favorites.value.size)

/* ---------- 搜索 + 分类（含「我的收藏」） ---------- */
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  return RECIPES.filter((r) => {
    if (category.value === '我的收藏') {
      if (!favorites.value.has(r.id)) return false
    } else if (category.value !== '全部' && r.category !== category.value) {
      return false
    }
    if (!q) return true
    if (r.name.toLowerCase().includes(q)) return true
    return r.grid.some((cell) => cell && (ITEMS[cell]?.name || '').toLowerCase().includes(q))
  })
})

/* ---------- 点击物品墙 -> 联动搜索图鉴 ---------- */
function searchByItem(name) {
  query.value = name
  category.value = '全部'
  nextTick(() => codexRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

/* ---------- 今日精选（随机配方） ---------- */
function randomRecipe() {
  return RECIPES[Math.floor(Math.random() * RECIPES.length)]
}
const featured = ref(randomRecipe())
function reroll() {
  featured.value = randomRecipe()
}

/* ---------- 世界状态 HUD（模拟游戏内状态，实时走动） ---------- */
const health = ref(20)
const hunger = ref(18)
const xp = ref(42)
const day = ref(1)
const minutes = ref(420) // 07:00
const weather = ref('晴朗')
const dimension = ref('主世界')
const difficulty = ref('普通')
const online = ref(3)
const coords = ref({ x: 128, y: 64, z: -32 })
let clockTimer = null

const clockText = computed(() => {
  const h = String(Math.floor(minutes.value / 60)).padStart(2, '0')
  const m = String(minutes.value % 60).padStart(2, '0')
  return `${h}:${m}`
})
const isNight = computed(() => minutes.value >= 1230 || minutes.value < 360)

function openRecipe(r) {
  selected.value = r
}

async function loadProfile() {
  loading.value = true
  error.value = ''
  try {
    user.value = await userApi.info()
  } catch (e) {
    error.value = e?.message || '加载失败，请重试'
  } finally {
    loading.value = false
  }
}

function logout() {
  clearSession()
  show('已退出登录')
  router.replace('/login')
}

onMounted(() => {
  if (!isLoggedIn()) {
    router.replace('/login')
    return
  }
  favorites.value = loadFavs()
  loadProfile()

  clockTimer = setInterval(() => {
    minutes.value = (minutes.value + 1) % 1440
    if (minutes.value === 0) day.value += 1
    if (Math.random() < 0.02) {
      weather.value = weather.value === '晴朗' ? '下雨' : Math.random() < 0.5 ? '雷暴' : '晴朗'
    }
    if (Math.random() < 0.3 && xp.value < 100) xp.value += 1
  }, 1500)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
})
</script>

<template>
  <div class="home">
    <!-- ============ 英雄欢迎区 ============ -->
    <section class="panel hero">
      <div class="hero-head">
        <h2>工作台 / WORKBENCH</h2>
        <span class="tag">BASE</span>
      </div>

      <div class="hero-body">
        <div class="welcome">
          <CreeperLogo class="avatar" />
          <div class="welcome-text">
            <p class="hi">
              欢迎回来，<b>{{ user?.nickname || user?.username || '冒险家' }}</b>！
            </p>
            <p class="sub">这是你的方块世界基地，向下探索合成图鉴与玩法特性。</p>
          </div>
        </div>

        <div v-if="loading" class="state">正在读取你的档案…</div>
        <div v-else-if="error" class="state error">
          {{ error }}
          <button class="retry" type="button" @click="loadProfile">重试</button>
        </div>
        <dl v-else class="profile">
          <div><dt>账号</dt><dd>{{ user.username }}</dd></div>
          <div><dt>昵称</dt><dd>{{ user.nickname || '—' }}</dd></div>
          <div><dt>邮箱</dt><dd>{{ user.email || '—' }}</dd></div>
          <div><dt>状态</dt><dd>{{ user.status === 1 ? '正常' : '已禁用' }}</dd></div>
        </dl>

        <div class="stats">
          <div class="stat"><b>{{ recipesCount }}</b><span>合成配方</span></div>
          <div class="stat"><b>{{ itemsCount }}</b><span>物品方块</span></div>
          <div class="stat"><b>{{ categoriesCount }}</b><span>图鉴分类</span></div>
          <div class="stat"><b>{{ favCount }}</b><span>我的收藏</span></div>
        </div>
      </div>

      <div class="hero-actions">
        <PixelButton variant="primary" @click="logout">退出登录</PixelButton>
        <router-link to="/login" class="link">返回登录页</router-link>
      </div>
    </section>

    <!-- ============ 世界状态 HUD ============ -->
    <section class="panel hud">
      <div class="panel-head">
        <h2>世界状态 / STATUS</h2>
        <span class="hint">{{ dimension }} · {{ difficulty }}</span>
      </div>

      <div class="hud-body">
        <div class="bars">
          <div class="bar-row">
            <span class="bar-label">生命</span>
            <span class="bar"><span class="fill health" :style="{ width: (health / 20) * 100 + '%' }" /></span>
            <span class="bar-text">{{ health }}/20</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">饥饿</span>
            <span class="bar"><span class="fill hunger" :style="{ width: (hunger / 20) * 100 + '%' }" /></span>
            <span class="bar-text">{{ hunger }}/20</span>
          </div>
          <div class="bar-row">
            <span class="bar-label">经验</span>
            <span class="bar"><span class="fill xp" :style="{ width: xp + '%' }" /></span>
            <span class="bar-text">{{ xp }}%</span>
          </div>
        </div>

        <div class="hud-info">
          <div><span class="k">天数</span><span class="v">第 {{ day }} 天</span></div>
          <div><span class="k">时间</span><span class="v">{{ clockText }} {{ isNight ? '夜晚' : '白天' }}</span></div>
          <div><span class="k">天气</span><span class="v">{{ weather }}</span></div>
          <div><span class="k">坐标</span><span class="v">X {{ coords.x }} / Y {{ coords.y }} / Z {{ coords.z }}</span></div>
          <div><span class="k">在线</span><span class="v">{{ online }} 人</span></div>
        </div>
      </div>
    </section>

    <!-- ============ 合成配方图鉴 ============ -->
    <section ref="codexRef" class="panel codex">
      <div class="panel-head">
        <h2>合成配方图鉴 / CRAFTING</h2>
        <span class="hint">点击卡片查看合成详情 · 收藏可持久保存</span>
      </div>

      <div class="toolbar">
        <input
          v-model="query"
          class="search"
          type="text"
          placeholder="搜索配方或材料，如「火把」「铁」…"
          aria-label="搜索配方"
        />
        <div class="cats">
          <button
            v-for="c in displayCategories"
            :key="c"
            type="button"
            class="cat-btn"
            :class="{ active: category === c }"
            @click="category = c"
          >
            {{ c }}
          </button>
        </div>
        <span class="result-count">共 {{ filtered.length }} 个</span>
      </div>

      <div class="recipe-list">
        <RecipeCard
          v-for="r in filtered"
          :key="r.id"
          :recipe="r"
          :faved="isFaved(r)"
          @open="openRecipe"
          @fav="toggleFav"
        />
      </div>
      <p v-if="filtered.length === 0" class="empty">没有匹配的配方，换个关键词或分类试试。</p>
    </section>

    <!-- ============ 今日精选配方 ============ -->
    <section class="panel featured">
      <div class="panel-head">
        <h2>今日精选 / PICK</h2>
        <button class="reroll" type="button" @click="reroll">换一个 ▸</button>
      </div>

      <div class="featured-body">
        <div class="grid">
          <MinecraftItem v-for="(cell, i) in featured.grid" :key="i" :item="cell" :size="40" />
        </div>
        <div class="featured-meta">
          <h3>{{ featured.name }}</h3>
          <span class="cat">{{ featured.category }}</span>
          <p class="tip">{{ featured.tip }}</p>
          <div class="featured-actions">
            <PixelButton variant="primary" @click="openRecipe(featured)">查看合成</PixelButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ 物品图鉴墙 ============ -->
    <section class="panel items">
      <div class="panel-head">
        <h2>物品图鉴 / ITEMS</h2>
        <span class="hint">点击方块可联动搜索对应配方</span>
      </div>
      <div class="item-wall">
        <button
          v-for="[key, meta] in itemsList"
          :key="key"
          type="button"
          class="item-cell"
          :title="`搜索「${meta.name}」相关配方`"
          @click="searchByItem(meta.name)"
        >
          <MinecraftItem :item="key" :size="46" />
          <span class="iname">{{ meta.name }}</span>
        </button>
      </div>
    </section>

    <!-- ============ 公告栏 ============ -->
    <section class="panel notices">
      <div class="panel-head">
        <h2>公告栏 / NEWS</h2>
        <span class="hint">来自方块世界的最新动态</span>
      </div>
      <ul class="notice-list">
        <li v-for="(n, i) in NOTICES" :key="i">
          <span class="n-tag" :class="n.tag">{{ n.tag }}</span>
          <div class="n-body">
            <p class="n-title">{{ n.title }}</p>
            <p class="n-text">{{ n.text }}</p>
          </div>
          <span class="n-date">{{ n.date }}</span>
        </li>
      </ul>
    </section>

    <!-- ============ 玩法特性 ============ -->
    <section class="panel features">
      <div class="panel-head">
        <h2>玩法特性 / FEATURES</h2>
        <span class="hint">探索这个方块宇宙能做什么</span>
      </div>
      <div class="feature-grid">
        <article v-for="f in FEATURES" :key="f.title" class="feature">
          <MinecraftItem :item="f.item" :size="52" :show-label="false" />
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </article>
      </div>
    </section>

    <!-- ============ 生物图鉴 ============ -->
    <section class="panel bio">
      <div class="panel-head">
        <h2>生物图鉴 / MOBS</h2>
        <span class="hint">主世界里会遇到的伙伴与麻烦</span>
      </div>
      <div class="bio-grid">
        <article
          v-for="b in BIO"
          :key="b.name"
          class="bio-card"
          :style="{ '--c': b.color }"
        >
          <span class="bio-face">{{ b.name.charAt(0) }}</span>
          <div class="bio-meta">
            <h3>{{ b.name }}</h3>
            <span class="bio-type" :class="b.type">{{ b.type }}</span>
            <p>{{ b.desc }}</p>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ 冒险者笔记 ============ -->
    <section class="panel notes">
      <div class="panel-head">
        <h2>冒险者笔记 / NOTES</h2>
        <span class="hint">老玩家的生存小贴士</span>
      </div>
      <ul class="tip-list">
        <li v-for="(t, i) in TIPS" :key="i"><span class="dot" />{{ t }}</li>
      </ul>
    </section>

    <!-- ============ 页脚 ============ -->
    <footer class="home-footer">
      <p class="foot-copy">{{ SITE.hudLeft }} · {{ SITE.hudRight }}</p>
      <div class="foot-actions">
        <router-link to="/login" class="link">返回登录页</router-link>
        <PixelButton variant="primary" @click="logout">退出登录</PixelButton>
      </div>
    </footer>

    <!-- 配方详情弹窗 -->
    <RecipeModal :recipe="selected" @close="selected = null" />
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

/* ---------------- 通用面板（沿用 GuiPanel 同款像素立体边） ---------------- */
.panel {
  width: min(100%, 860px);
  margin-top: 22px;
  background: var(--gui);
  border: 3px solid var(--gui-line);
  box-shadow: inset 3px 3px 0 var(--gui-hi), inset -3px -3px 0 var(--gui-lo),
    8px 8px 0 rgba(0, 0, 0, 0.3);
  animation: panelIn 0.35s steps(6, end) both;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
  padding: 12px var(--panel-pad);
  background: var(--gui-dark);
  border-top: 3px solid var(--gui-dark-line);
  border-bottom: 3px solid var(--gui-dark-line);
  box-shadow: inset 0 3px 0 #5a5a5a;
}

.panel-head h2 {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #fff;
  text-shadow: 2px 2px 0 var(--gui-line);
}

.hint {
  font-size: 10px;
  color: #d8d8d8;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
  white-space: nowrap;
}

@keyframes panelIn {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---------------- 英雄区 ---------------- */
.hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px var(--panel-pad);
  background: var(--gui-dark);
  border-bottom: 3px solid var(--gui-dark-line);
  box-shadow: inset 0 3px 0 #5a5a5a;
}

.hero-head h2 {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.16em;
  color: #fff;
  text-shadow: 2px 2px 0 var(--gui-line);
}

.tag {
  font-size: 10px;
  color: #163a07;
  background: var(--accent);
  padding: 2px 8px;
  border: 2px solid #fff;
  text-shadow: none;
}

.hero-body {
  padding: 20px var(--panel-pad);
}

.welcome {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 18px;
}

.avatar {
  flex: none;
}

.hi {
  margin: 0;
  font-size: 16px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.hi b {
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.5);
}

.sub {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.state {
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
  margin-bottom: 18px;
}

.state.error {
  color: var(--danger);
  text-shadow: none;
}

.retry {
  margin-left: 8px;
  font-family: var(--font);
  font-size: 11px;
  color: var(--link);
  background: transparent;
  border: 2px solid var(--link-underline);
  cursor: pointer;
}

.profile {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 18px;
  margin: 0 0 18px;
}

.profile div {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px dashed #a8a8a8;
  padding-bottom: 4px;
}

.profile dt {
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.profile dd {
  margin: 0;
  font-weight: 700;
  color: var(--ink);
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  background: var(--gui-dark);
  border: 3px solid var(--gui-dark-line);
  box-shadow: inset 2px 2px 0 #5a5a5a;
}

.stat b {
  font-family: var(--font);
  font-size: 22px;
  color: var(--accent);
  text-shadow: 2px 2px 0 #163a07;
  line-height: 1;
}

.stat span {
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 var(--panel-pad) 20px;
}

.hero-actions :deep(.btn-primary) {
  width: auto;
  height: 40px;
  margin-top: 0;
  padding: 0 18px;
}

/* ---------------- 世界状态 HUD ---------------- */
.hud-body {
  padding: 0 var(--panel-pad) var(--panel-pad);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
}

.bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.bar-label {
  flex: none;
  width: 34px;
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.bar {
  flex: 1;
  height: 14px;
  background: var(--gui-line);
  border: 2px solid;
  border-color: var(--btn-edge) #e0e0e0 #e0e0e0 var(--btn-edge);
}

.fill {
  display: block;
  height: 100%;
}

.fill.health {
  background: #d23b2b;
}

.fill.hunger {
  background: #6ee04f;
}

.fill.xp {
  background: #56d6e0;
}

.bar-text {
  flex: none;
  width: 44px;
  text-align: right;
  font-size: 11px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.hud-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
  align-content: center;
}

.hud-info > div {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px dashed #a8a8a8;
  padding-bottom: 4px;
}

.hud-info .k {
  font-size: 11px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.hud-info .v {
  font-size: 11px;
  font-weight: 700;
  color: var(--ink);
}

/* ---------------- 工具栏：搜索 + 分类 ---------------- */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 0 var(--panel-pad);
  margin-bottom: 18px;
}

.search {
  flex: 1;
  min-width: 200px;
  font-family: var(--font);
  font-size: 11px;
  color: #fff;
  background: #3f3f3f;
  border: 3px solid;
  border-color: var(--gui-lo) var(--gui-hi) var(--gui-hi) var(--gui-lo);
  padding: 11px 12px;
}

.search::placeholder {
  color: #bcbcbc;
}

.search:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--accent-ring);
}

.cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.cat-btn {
  font-family: var(--font);
  font-size: 11px;
  color: var(--btn-text);
  background: var(--btn);
  border: 3px solid;
  border-color: var(--gui-hi) var(--btn-edge) var(--btn-edge) var(--gui-hi);
  padding: 7px 11px;
  cursor: pointer;
  text-shadow: 1px 1px 0 var(--ink);
}

.cat-btn:hover:not(.active) {
  background: var(--btn-hover);
}

.cat-btn.active {
  background: var(--accent);
  color: #163a07;
  text-shadow: none;
  border-color: #ffffff var(--grass-line) var(--grass-line) #ffffff;
}

.result-count {
  margin-left: auto;
  font-size: 11px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
  white-space: nowrap;
}

/* ---------------- 配方列表 ---------------- */
.recipe-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
  gap: 14px;
  padding: 0 var(--panel-pad) var(--panel-pad);
}

.empty {
  padding: 0 var(--panel-pad) var(--panel-pad);
  font-size: 12px;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

/* ---------------- 今日精选 ---------------- */
.reroll {
  font-family: var(--font);
  font-size: 11px;
  color: var(--btn-text);
  background: var(--btn);
  border: 3px solid;
  border-color: var(--gui-hi) var(--btn-edge) var(--btn-edge) var(--gui-hi);
  padding: 6px 10px;
  cursor: pointer;
  text-shadow: 1px 1px 0 var(--ink);
}

.reroll:hover {
  background: var(--btn-hover);
  color: var(--btn-highlight);
}

.featured-body {
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 0 var(--panel-pad) var(--panel-pad);
  flex-wrap: wrap;
}

.featured-body .grid {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  grid-template-rows: repeat(3, 40px);
  gap: 3px;
  padding: 6px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
  flex: none;
}

.featured-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.featured-meta h3 {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.08em;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.featured-meta .cat {
  font-size: 10px;
  color: #fff;
  background: var(--accent);
  padding: 2px 6px;
  border: 2px solid var(--grass-line);
  text-shadow: 1px 1px 0 var(--grass-line);
}

.featured-meta .tip {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.featured-meta :deep(.btn-primary) {
  width: auto;
  height: 40px;
  margin-top: 4px;
  padding: 0 18px;
}

/* ---------------- 物品图鉴墙 ---------------- */
.item-wall {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 10px;
  padding: 0 var(--panel-pad) var(--panel-pad);
}

.item-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 10px 4px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: transform 0.08s steps(2, end);
}

.item-cell:hover {
  transform: translateY(-2px);
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.4), 0 0 0 2px var(--accent-ring);
}

.iname {
  font-size: 10px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
  text-align: center;
}

/* ---------------- 公告栏 ---------------- */
.notice-list {
  margin: 0;
  padding: 0 var(--panel-pad) var(--panel-pad);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notice-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #5a5a5a;
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.35);
}

.n-tag {
  flex: none;
  font-size: 10px;
  color: #163a07;
  background: var(--accent);
  padding: 3px 8px;
  border: 2px solid #fff;
}

.n-tag.活动 {
  background: var(--splash);
}

.n-tag.公告 {
  background: var(--danger);
  color: #fff;
}

.n-tag.提示 {
  background: var(--link);
  color: #fff;
}

.n-body {
  flex: 1;
}

.n-title {
  margin: 0;
  font-size: 12px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.n-text {
  margin: 3px 0 0;
  font-size: 11px;
  color: #e9e9e9;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
}

.n-date {
  flex: none;
  font-size: 10px;
  color: #cfcfcf;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.5);
}

/* ---------------- 玩法特性 ---------------- */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
  gap: 14px;
  padding: 0 var(--panel-pad) var(--panel-pad);
}

.feature {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 16px;
  background: #5a5a5a;
  border: 3px solid #000;
  box-shadow: inset 3px 3px 0 rgba(0, 0, 0, 0.35);
}

.feature h3 {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.feature p {
  margin: 0;
  font-size: 11px;
  line-height: 1.7;
  color: #e9e9e9;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
}

/* ---------------- 生物图鉴 ---------------- */
.bio-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(248px, 1fr));
  gap: 14px;
  padding: 0 var(--panel-pad) var(--panel-pad);
}

.bio-card {
  display: flex;
  gap: 12px;
  padding: 14px;
  background: #5a5a5a;
  border: 3px solid #000;
  box-shadow: inset 3px 3px 0 rgba(0, 0, 0, 0.35);
}

.bio-face {
  flex: none;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font);
  font-size: 18px;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
  background-color: var(--c);
  background-image: linear-gradient(135deg, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0) 42%),
    linear-gradient(315deg, rgba(0, 0, 0, 0.32), rgba(0, 0, 0, 0) 45%);
  border: 2px solid #000;
  box-shadow: inset 2px 2px 0 rgba(255, 255, 255, 0.22), inset -2px -2px 0 rgba(0, 0, 0, 0.38);
}

.bio-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}

.bio-meta h3 {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #fff;
  text-shadow: 1px 1px 0 #000;
}

.bio-type {
  font-size: 10px;
  color: #163a07;
  background: var(--accent);
  padding: 1px 6px;
  border: 2px solid #fff;
}

.bio-type.敌对 {
  background: var(--danger);
  color: #fff;
}

.bio-type.中立 {
  background: var(--splash);
}

.bio-meta p {
  margin: 0;
  font-size: 11px;
  line-height: 1.6;
  color: #e9e9e9;
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
}

/* ---------------- 冒险者笔记 ---------------- */
.tip-list {
  margin: 0;
  padding: 0 var(--panel-pad) var(--panel-pad) calc(var(--panel-pad) + 4px);
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tip-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--ink);
  text-shadow: var(--ink-emboss);
}

.dot {
  flex: none;
  width: 10px;
  height: 10px;
  margin-top: 4px;
  background: var(--accent);
  border: 2px solid var(--grass-line);
}

/* ---------------- 页脚 ---------------- */
.home-footer {
  width: min(100%, 860px);
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px 0 8px;
}

.foot-copy {
  margin: 0;
  font-size: 9px;
  color: #fff;
  text-shadow: 2px 2px 0 rgba(0, 0, 0, 0.55);
}

.foot-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.foot-actions :deep(.btn-primary) {
  width: auto;
  height: 38px;
  margin-top: 0;
  padding: 0 16px;
}

.link {
  font-size: 12px;
  color: var(--link);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.6);
  border-bottom: 2px solid var(--link-underline);
}

.link:hover {
  color: var(--link-hover);
  border-bottom-color: var(--link-hover);
}

@media (max-width: 640px) {
  .profile,
  .stats,
  .hud-body,
  .hud-info {
    grid-template-columns: 1fr 1fr;
  }

  .stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .recipe-list,
  .feature-grid,
  .bio-grid {
    grid-template-columns: 1fr;
  }

  .result-count {
    margin-left: 0;
  }

  .home-footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
