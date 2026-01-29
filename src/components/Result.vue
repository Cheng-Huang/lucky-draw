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
    <div class="result-safe">
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

      <div class="listrow not-winners">
        <span class="name">
          未中奖名单
          <span class="count" v-if="notWinnerIds && notWinnerIds.length > 0">
            ({{ notWinnerIds.length }})
          </span>
        </span>
        <span class="value">
          <span v-if="!notWinnerIds || notWinnerIds.length === 0">
            暂无
          </span>
          <span class="winners" v-else>
            <span class="winner" v-for="(id, j) in notWinnerIds" :key="j">
              {{ getWinnerName(id) }}
            </span>
          </span>
        </span>
      </div>
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
    notWinnerIds() {
      const config = this.config || {};
      const total = Number(config.number || 0);

      // Participants: prefer explicit people list, else 1..number.
      let participants = [];
      if (Array.isArray(this.list) && this.list.length > 0) {
        participants = this.list
          .map(p => Number(p && p.key))
          .filter(n => Number.isFinite(n) && n > 0);
      } else if (Number.isFinite(total) && total > 0) {
        participants = Array.from({ length: total }, (_, i) => i + 1);
      } else {
        return [];
      }

      // Winners: union all result arrays.
      const winners = new Set();
      const result = this.result || {};
      Object.keys(result).forEach(k => {
        const arr = result[k];
        if (!Array.isArray(arr)) {
          return;
        }
        arr.forEach(id => {
          const n = Number(id);
          if (Number.isFinite(n) && n > 0) {
            winners.add(n);
          }
        });
      });

      // Unique + stable order.
      const uniqueParticipants = Array.from(new Set(participants));
      uniqueParticipants.sort((a, b) => a - b);

      return uniqueParticipants.filter(id => !winners.has(id));
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
  --result-safe-x: clamp(80px, 18vw, 680px);

  .el-dialog__header {
    padding-left: var(--result-safe-x);
    padding-right: var(--result-safe-x);
  }
  .el-dialog__headerbtn {
    right: var(--result-safe-x);
  }
  .el-dialog__body {
    height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: auto;
    padding-left: var(--result-safe-x);
    padding-right: var(--result-safe-x);
  }
  .result-safe {
    width: min(1400px, 100%);
    margin: 0 auto;
    padding-bottom: 24px;
  }
  .listrow {
    display: grid;
    grid-template-columns: minmax(140px, 220px) 1fr;
    column-gap: 12px;
    align-items: start;
    padding: 12px 0;
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
  .not-winners {
    margin-top: 18px;
    border-top: 2px solid rgba(17, 24, 39, 0.1);
    padding-top: 18px;
    .count {
      font-weight: normal;
      color: rgba(17, 24, 39, 0.6);
      margin-left: 6px;
    }
    .winner {
      background-color: rgba(255, 255, 255, 0.7);
      border-color: rgba(17, 24, 39, 0.1);
      cursor: default;
      &:hover {
        &::before {
          content: '';
          display: none;
        }
      }
    }
  }
}
</style>
