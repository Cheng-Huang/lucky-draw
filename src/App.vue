<template>
  <div id="root">
    <header>
      <Publicity v-show="!running" />
      <div v-show="!showResult && !showPrizeList" class="webex-logo-float">
        <img :src="webexLogoSrc" alt="Webex" />
      </div>
      <div v-show="!showResult && !showPrizeList" class="header-actions">
        <el-dropdown
          class="header-dropdown"
          trigger="click"
          placement="bottom-end"
          @command="onSettingsCommand"
        >
          <el-button
            class="header-btn header-icon-btn"
            type="text"
            title="设置"
          >
            <i class="el-icon-setting"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown" class="settings-menu">
            <el-dropdown-item command="showResult">抽奖结果</el-dropdown-item>
            <el-dropdown-item command="showPrizeList"
              >奖品清单</el-dropdown-item
            >
            <el-dropdown-item divided command="config"
              >抽奖配置</el-dropdown-item
            >
            <el-dropdown-item command="reset">重置</el-dropdown-item>
            <el-dropdown-item command="importList">导入名单</el-dropdown-item>
            <el-dropdown-item command="importPhoto">导入照片</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>

        <el-button
          class="header-btn header-icon-btn"
          type="text"
          :title="audioPlaying ? '音乐：暂停' : '音乐：播放'"
          @click="playAudio(!audioPlaying)"
        >
          <i
            :class="audioPlaying ? 'el-icon-video-pause' : 'el-icon-video-play'"
          ></i>
        </el-button>
      </div>
    </header>
    <div id="main" :class="{ mask: showRes }"></div>
    <div id="tags">
      <ul v-for="item in datas" :key="item.key">
        <li>
          <a
            href="javascript:void(0);"
            :style="{
              color: '#fff'
            }"
          >
            {{ item.name ? item.name : item.key }}
            <img v-if="item.photo" :src="item.photo" :width="50" :height="50" />
          </a>
        </li>
      </ul>
    </div>
    <transition name="bounce">
      <div id="resbox" v-show="showRes">
        <p class="resbox-title" @click="showRes = false">
          <span class="resbox-title-text">{{ categoryName }}</span>
        </p>
        <div class="container">
          <span
            v-for="item in resArr"
            :key="item"
            class="itemres"
            :style="resCardStyle"
            @click="showRes = false"
          >
            <span class="cont" v-if="!photos.find(d => d.id === item)">
              <span v-if="!!list.find(d => d.key === item)" class="winner-name">
                {{ list.find(d => d.key === item).name }}
              </span>
              <span v-else>
                {{ item }}
              </span>
            </span>
            <img
              v-if="photos.find(d => d.id === item)"
              :src="photos.find(d => d.id === item).value"
              alt="photo"
              :width="160"
              :height="160"
            />
          </span>
        </div>
        <p class="resbox-close-tip" @click="showRes = false">
          点击任意卡片关闭
        </p>
      </div>
    </transition>

    <LotteryConfig :visible.sync="showConfig" @resetconfig="reloadTagCanvas" />
    <Tool
      ref="tool"
      @toggle="toggle"
      @resetConfig="reloadTagCanvas"
      @getPhoto="getPhoto"
      :running="running"
      :closeRes="closeRes"
      v-show="!showResult && !showPrizeList"
    />
    <Result :visible.sync="showResult"></Result>
    <PrizeList :visible.sync="showPrizeList" />

    <span class="copy-right">
      Copyright©zhangyongfeng5350@gmail.com
    </span>

    <audio
      id="audiobg"
      preload="auto"
      controls
      autoplay
      loop
      @play="playHandler"
      @pause="pauseHandler"
    >
      <source :src="audioSrc" />
      你的浏览器不支持audio标签
    </audio>
  </div>
</template>
<script>
import LotteryConfig from '@/components/LotteryConfig';
import Publicity from '@/components/Publicity';
import Tool from '@/components/Tool';
import bgaudio from '@/assets/bg.mp3';
import beginaudio from '@/assets/begin.mp3';
import {
  getData,
  configField,
  resultField,
  newLotteryField,
  conversionCategoryName,
  listField
} from '@/helper/index';
import { luckydrawHandler } from '@/helper/algorithm';
import Result from '@/components/Result';
import PrizeList from '@/components/PrizeList';
import { database, DB_STORE_NAME } from '@/helper/db';
export default {
  name: 'App',

  components: { LotteryConfig, Publicity, Tool, Result, PrizeList },

  computed: {
    webexLogoSrc() {
      const baseUrl = (process && process.env && process.env.BASE_URL) || '/';
      return `${baseUrl}webex-logo.svg`;
    },
    resCardStyle() {
      const style = { fontSize: '30px' };
      const { number } = this.config;
      if (number < 100) {
        style.fontSize = '100px';
      } else if (number < 1000) {
        style.fontSize = '80px';
      } else if (number < 10000) {
        style.fontSize = '60px';
      }
      return style;
    },
    config: {
      get() {
        return this.$store.state.config;
      }
    },
    result: {
      get() {
        return this.$store.state.result;
      },
      set(val) {
        this.$store.commit('setResult', val);
      }
    },
    list() {
      return this.$store.state.list;
    },
    allresult() {
      let allresult = [];
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          allresult = allresult.concat(element);
        }
      }
      return allresult;
    },
    datas() {
      const { number } = this.config;
      const nums = number >= 1500 ? 500 : this.config.number;
      const configNum = number > 1500 ? Math.floor(number / 3) : number;
      const randomShowNums = luckydrawHandler(configNum, [], nums);
      const randomShowDatas = randomShowNums.map(item => {
        const listData = this.list.find(d => d.key === item);
        const photo = this.photos.find(d => d.id === item);
        return {
          key: item * (number > 1500 ? 3 : 1),
          name: listData ? listData.name : '',
          photo: photo ? photo.value : ''
        };
      });
      return randomShowDatas;
    },
    categoryName() {
      return conversionCategoryName(this.category);
    },
    photos() {
      return this.$store.state.photos;
    }
  },
  created() {
    this.loadFileConfigIfNeeded();
    const data = getData(configField);
    if (data) {
      this.$store.commit('setConfig', Object.assign({}, data));
    }
    const result = getData(resultField);
    if (result) {
      this.$store.commit('setResult', result);
    }

    const newLottery = getData(newLotteryField);
    if (newLottery) {
      const config = this.config;
      newLottery.forEach(item => {
        this.$store.commit('setNewLottery', item);
        if (!config[item.key]) {
          this.$set(config, item.key, 0);
        }
      });
      this.$store.commit('setConfig', config);
    }

    const list = getData(listField);
    if (list) {
      this.$store.commit('setList', list);
    }
  },

  data() {
    return {
      running: false,
      showRes: false,
      showConfig: false,
      showResult: false,
      showPrizeList: false,
      resArr: [],
      category: '',
      audioPlaying: false,
      audioSrc: bgaudio
    };
  },
  watch: {
    photos: {
      deep: true,
      handler() {
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      }
    },
    showPrizeList(v) {
      if (v) {
        this.loadFileConfigIfNeeded();
      }
    }
  },
  mounted() {
    this.startTagCanvas();
    setTimeout(() => {
      this.getPhoto();
    }, 1000);
    window.addEventListener('resize', this.reportWindowSize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.reportWindowSize);
  },
  methods: {
    onSettingsCommand(command) {
      switch (command) {
        case 'showResult':
          this.showResult = true;
          break;
        case 'showPrizeList':
          this.showPrizeList = true;
          break;
        case 'config':
          this.showConfig = true;
          break;
        case 'reset':
          this.$refs.tool && this.$refs.tool.openResetOptions();
          break;
        case 'importList':
          this.$refs.tool && this.$refs.tool.openImportList();
          break;
        case 'importPhoto':
          this.$refs.tool && this.$refs.tool.openImportPhoto();
          break;
        default:
          break;
      }
    },
    async loadFileConfigIfNeeded() {
      try {
        const params = new URLSearchParams(window.location.search || '');
        const forceFile = params.get('config') === 'file';
        const reset = params.get('reset') === '1';
        const hasLocalConfig =
          !!getData(configField) ||
          !!getData(newLotteryField) ||
          !!getData(listField);

        if (!forceFile && hasLocalConfig) {
          return;
        }

        const baseUrl = (process && process.env && process.env.BASE_URL) || '/';
        const url = `${baseUrl}lottery-config.json`;
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) {
          return;
        }
        const cfg = await res.json();
        if (!cfg || !cfg.prizes || !Array.isArray(cfg.prizes)) {
          return;
        }

        // Optionally reset results to avoid mismatch with new prize keys.
        if (reset) {
          this.$store.commit('setClearResult');
          localStorage.removeItem(resultField);
        }

        const title = typeof cfg.title === 'string' ? cfg.title : '年会抽奖';
        const number = Number(cfg.number || 0);
        if (!number || number <= 0) {
          return;
        }

        // Build config + prize metadata.
        const config = { name: title, number };
        const prizes = cfg.prizes
          .map(p => ({
            key: (p && p.key) || this.makePrizeKey(p && p.name),
            name: (p && p.name ? String(p.name) : '').trim(),
            count: Number(p && p.count)
          }))
          .filter(p => p.key && p.name);

        prizes.forEach(p => {
          config[p.key] = Number.isFinite(p.count) ? Math.max(0, p.count) : 0;
        });

        // Replace prize metadata list.
        localStorage.setItem(
          newLotteryField,
          JSON.stringify(prizes.map(p => ({ key: p.key, name: p.name })))
        );

        // Apply store state.
        this.$store.commit('setClearConfig');
        this.$store.commit('setConfig', config);
        prizes.forEach(p => {
          this.$store.commit('upsertLotteryMeta', { key: p.key, name: p.name });
        });

        // Optional people list: [{key:number,name:string}, ...]
        if (Array.isArray(cfg.people) && cfg.people.length > 0) {
          const people = cfg.people
            .map(p => ({
              key: Number(p && p.key),
              name: (p && p.name ? String(p.name) : '').trim()
            }))
            .filter(p => p.key > 0 && p.name);

          if (people.length > 0) {
            this.$store.commit('setClearList');
            this.$store.commit('setList', people);
          }
        }
      } catch (e) {
        // Ignore config load failures; fall back to localStorage/defaults.
      }
    },
    makePrizeKey(name) {
      const n = String(name || '').trim();
      if (!n) {
        return '';
      }
      // Stable, simple hash (djb2) to support non-latin names too.
      let hash = 5381;
      for (let i = 0; i < n.length; i++) {
        hash = (hash * 33) ^ n.charCodeAt(i);
      }
      const safe = n
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      return `prize_${safe || 'p'}_${(hash >>> 0).toString(16)}`;
    },
    reportWindowSize() {
      const AppCanvas = this.$el.querySelector('#rootcanvas');
      if (AppCanvas.parentElement) {
        AppCanvas.parentElement.removeChild(AppCanvas);
      }
      this.startTagCanvas();
    },
    playHandler() {
      this.audioPlaying = true;
    },
    pauseHandler() {
      this.audioPlaying = false;
    },
    playAudio(type) {
      if (type) {
        this.$el.querySelector('#audiobg').play();
      } else {
        this.$el.querySelector('#audiobg').pause();
      }
    },
    loadAudio() {
      this.$el.querySelector('#audiobg').load();
      this.$nextTick(() => {
        this.$el.querySelector('#audiobg').play();
      });
    },
    getPhoto() {
      database.getAll(DB_STORE_NAME).then(res => {
        if (res && res.length > 0) {
          this.$store.commit('setPhotos', res);
        }
      });
    },
    speed() {
      return [0.1 * Math.random() + 0.01, -(0.1 * Math.random() + 0.01)];
    },
    createCanvas() {
      const canvas = document.createElement('canvas');
      canvas.width = document.body.offsetWidth;
      canvas.height = document.body.offsetHeight;
      canvas.id = 'rootcanvas';
      this.$el.querySelector('#main').appendChild(canvas);
    },
    startTagCanvas() {
      this.createCanvas();
      const { speed } = this;
      window.TagCanvas.Start('rootcanvas', 'tags', {
        textColour: null,
        initial: speed(),
        dragControl: 1,
        textHeight: 20,
        noSelect: true,
        lock: 'xy'
      });
    },
    reloadTagCanvas() {
      window.TagCanvas.Reload('rootcanvas');
    },
    closeRes() {
      this.showRes = false;
    },
    toggle(form) {
      const { speed, config } = this;
      if (this.running) {
        this.audioSrc = bgaudio;
        this.loadAudio();

        window.TagCanvas.SetSpeed('rootcanvas', speed());
        this.showRes = true;
        this.running = !this.running;
        this.$nextTick(() => {
          this.reloadTagCanvas();
        });
      } else {
        this.showRes = false;
        if (!form) {
          return;
        }

        this.audioSrc = beginaudio;
        this.loadAudio();

        const { number } = config;
        const { category, mode, qty, remain, allin } = form;
        let num = 1;
        if (mode === 1 || mode === 5) {
          num = mode;
        } else if (mode === 0) {
          num = remain;
        } else if (mode === 99) {
          num = qty;
        }
        const resArr = luckydrawHandler(
          number,
          allin ? [] : this.allresult,
          num
        );
        this.resArr = resArr;

        this.category = category;
        if (!this.result[category]) {
          this.$set(this.result, category, []);
        }
        const oldRes = this.result[category] || [];
        const data = Object.assign({}, this.result, {
          [category]: oldRes.concat(resArr)
        });
        this.result = data;
        window.TagCanvas.SetSpeed('rootcanvas', [5, 1]);
        this.running = !this.running;
      }
    }
  }
};
</script>
<style lang="scss">
#root {
  height: 100%;
  position: relative;
  background-image: url('./assets/bg1.jpg');
  background-size: 100% 100%;
  background-position: center center;
  background-repeat: no-repeat;
  background-color: #121936;
  .mask {
    -webkit-filter: blur(5px);
    filter: blur(5px);
  }
  header {
    height: 48px;
    line-height: 48px;
    position: relative;
    overflow: visible;
    .header-actions {
      position: absolute;
      top: 0;
      right: 20px;
      height: 48px;
      display: flex;
      align-items: center;
      gap: 18px;
      z-index: 1100;
    }
    .header-btn {
      padding: 0;
      height: 48px;
      line-height: 48px;
    }
    .header-icon-btn {
      width: 44px;
      text-align: center;
      i {
        font-size: 22px;
      }
    }
  }
  .webex-logo-float {
    position: absolute;
    left: 12px;
    top: 6px;
    z-index: 1090;
    pointer-events: none;
    padding: 10px 12px;
    img {
      height: 84px;
      width: auto;
      display: block;
    }
  }
  .copy-right {
    position: absolute;
    right: 0;
    bottom: 0;
    color: #ccc;
    font-size: 12px;
  }
  .bounce-enter-active {
    animation: bounce-in 1.5s;
  }
  .bounce-leave-active {
    animation: bounce-in 0s reverse;
  }
}
#main {
  height: 100%;
}

#rootcanvas {
  transform: translateY(-48px);
}

#resbox {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 92vw;
  max-width: 1200px;
  max-height: 75vh;
  transform: translateX(-50%) translateY(-50%);
  text-align: center;
  overflow: auto;
  padding: 10px 10px 20px;
  p {
    color: red;
    font-size: 42px;
    line-height: 70px;
    margin: 0 0 10px;
  }
  .container {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }
  .itemres {
    background: #fff;
    min-width: 220px;
    min-height: 80px;
    border-radius: 4px;
    border: 1px solid #ccc;
    line-height: 1.2;
    font-weight: bold;
    margin-right: 20px;
    margin-bottom: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding: 14px 12px;
    .cont {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    .winner-name {
      font-size: 36px;
      line-height: 1.2;
      white-space: normal;
      word-break: break-word;
      text-align: center;
      width: 100%;
    }
  }
  .resbox-title {
    margin: 0 0 14px;
  }
  .resbox-title-text {
    display: block;
    font-weight: 900;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.55);
    white-space: normal;
    word-break: break-word;
    text-align: center;
  }
  .resbox-close-tip {
    margin: 6px 0 0;
    font-size: 14px;
    line-height: 20px;
    color: rgba(255, 255, 255, 0.75);
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }
}
</style>
