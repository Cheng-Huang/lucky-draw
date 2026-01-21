<template>
  <el-dialog
    :visible="visible"
    @close="$emit('update:visible', false)"
    :fullscreen="true"
    class="c-Result"
    :append-to-body="true"
  >
    <div class="dialog-title" slot="title">
      <span :style="{ fontSize: '18px' }">
        抽奖结果
      </span>
      <span :style="{ fontSize: '14px', color: '#999', marginLeft: '10px' }">
        (点击姓名可以删除)
      </span>
    </div>
    <div
      v-for="(item, index) in resultList"
      :key="index"
      class="listrow"
      @click="
        event => {
          deleteRes(event, item);
        }
      "
    >
      <span class="name">
        {{ item.name }}
      </span>
      <span class="value">
        <span v-if="item.value && item.value.length === 0">
          暂未抽奖
        </span>
        <span class="winners" v-else>
          <span
            class="winner"
            v-for="(data, j) in item.value"
            :key="j"
            :data-res="data"
          >
            {{ getWinnerName(data) }}
          </span>
        </span>
      </span>
    </div>
  </el-dialog>
</template>
<script>
import { conversionCategoryName, getDomData } from '@/helper/index';
export default {
  name: 'c-Result',
  props: {
    visible: Boolean
  },
  computed: {
    config() {
      return this.$store.state.config;
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
    resultList() {
      const list = [];
      const cfg = this.config || {};
      for (const key in cfg) {
        if (!Object.prototype.hasOwnProperty.call(cfg, key)) {
          continue;
        }
        const count = cfg[key];
        if (typeof count !== 'number' || count <= 0) {
          continue;
        }
        const name = conversionCategoryName(key);
        if (!name) {
          continue;
        }
        list.push({
          label: key,
          name,
          value: this.result && this.result[key] ? this.result[key] : []
        });
      }
      return list;
    }
  },
  methods: {
    getWinnerName(id) {
      const key = Number(id);
      const item = (this.list || []).find(d => d.key === key);
      return item && item.name ? item.name : String(id);
    },
    deleteRes(event, row) {
      const Index = getDomData(event.target, 'res');
      if (!Index) {
        return;
      }
      this.$confirm('此操作将移除该中奖号码，确认删除?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          if (Index) {
            const result = this.result;
            result[row.label] = this.result[row.label].filter(
              item => item !== Number(Index)
            );
            this.result = result;
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
          }
        })
        .catch(() => {
          this.$message({
            type: 'info',
            message: '已取消'
          });
        });
    }
  }
};
</script>
<style lang="scss">
.c-Result {
  .el-dialog__body {
    height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: auto;
  }
  .listrow {
    display: grid;
    grid-template-columns: minmax(220px, 320px) 1fr;
    column-gap: 16px;
    align-items: start;
    padding: 12px 18px;
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
    .name {
      text-align: left;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .value {
      min-width: 0;
      text-align: left;
    }
    .winners {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 10px;
    }
    .winner {
      display: inline-flex;
      align-items: center;
      justify-content: flex-start;
      padding: 6px 10px;
      line-height: 20px;
      text-align: left;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px;
      border: 1px solid rgba(17, 24, 39, 0.14);
      background-color: rgba(255, 255, 255, 0.92);
      position: relative;
      cursor: pointer;
      white-space: nowrap;
      &:hover {
        &::before {
          content: '删除';
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.08);
          position: absolute;
          left: 0;
          top: 0;
          color: red;
        }
      }
    }
  }
}
</style>
