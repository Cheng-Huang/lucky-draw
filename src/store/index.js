import Vue from 'vue';
import Vuex from 'vuex';
import {
  setData,
  configField,
  resultField,
  newLotteryField,
  listField
} from '@/helper/index';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    config: {
      name: '年会抽奖',
      number: 70,
      firstPrize: 1
    },
    result: {
      firstPrize: []
    },
    newLottery: [],
    list: [],
    photos: []
  },
  mutations: {
    setClearConfig(state) {
      state.config = {
        name: '年会抽奖',
        number: 70,
        firstPrize: 1
      };
      state.newLottery = [];
    },
    setClearList(state) {
      state.list = [];
    },
    setClearPhotos(state) {
      state.photos = [];
    },
    setClearResult(state) {
      state.result = {
        firstPrize: []
      };
    },
    setClearStore(state) {
      state.config = {
        name: '年会抽奖',
        number: 70,
        firstPrize: 1
      };
      state.result = {
        firstPrize: []
      };
      state.newLottery = [];
      state.list = [];
      state.photos = [];
    },
    setConfig(state, config) {
      state.config = config;
      setData(configField, state.config);
    },
    setResult(state, result = {}) {
      state.result = result;

      setData(resultField, state.result);
    },
    setNewLottery(state, newLottery) {
      if (
        state.newLottery.find(
          item => item.key === newLottery.key || item.name === newLottery.name
        )
      ) {
        return;
      }
      state.newLottery.push(newLottery);
      setData(newLotteryField, state.newLottery);
    },
    upsertLotteryMeta(state, meta) {
      const { key, name } = meta || {};
      if (!key || !name) {
        return;
      }
      const idx = state.newLottery.findIndex(item => item.key === key);
      if (idx > -1) {
        state.newLottery[idx].name = name;
      } else {
        state.newLottery.push({ key, name });
      }
      setData(newLotteryField, state.newLottery);
    },
    removeLottery(state, key) {
      if (!key) {
        return;
      }
      state.newLottery = state.newLottery.filter(item => item.key !== key);
      if (Object.prototype.hasOwnProperty.call(state.config, key)) {
        Vue.delete(state.config, key);
      }
      if (Object.prototype.hasOwnProperty.call(state.result, key)) {
        Vue.delete(state.result, key);
      }
      setData(newLotteryField, state.newLottery);
      setData(configField, state.config);
      setData(resultField, state.result);
    },
    setList(state, list) {
      const arr = state.list;
      list.forEach(item => {
        const arrIndex = arr.findIndex(data => data.key === item.key);
        if (arrIndex > -1) {
          arr[arrIndex].name = item.name;
        } else {
          arr.push(item);
        }
      });
      state.list = arr;

      setData(listField, arr);
    },
    setPhotos(state, photos) {
      state.photos = photos;
    }
  },
  actions: {},
  modules: {}
});
