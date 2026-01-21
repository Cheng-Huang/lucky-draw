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
        (点击号码可以删除)
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
        <span
          class="card"
          v-for="(data, j) in item.value"
          :key="j"
          :data-res="data"
        >
          {{ getWinnerName(data) }}
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
      for (const key in this.result) {
        if (this.result.hasOwnProperty(key)) {
          const element = this.result[key];
          let name = conversionCategoryName(key);
          list.push({
            label: key,
            name,
            value: element
          });
        }
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
  .el-dialog {
    margin: 0 !important;
    height: 100vh;
    max-height: 100vh;
    width: 100vw;
  }
  .el-dialog__body {
    height: calc(100vh - 60px);
    overflow-y: auto;
    overflow-x: auto;
  }
  .listrow {
    display: flex;
    line-height: 30px;
    align-items: flex-start;
    .name {
      flex: 0 0 auto;
      font-weight: bold;
      white-space: nowrap;
      margin-right: 10px;
    }
    .value {
      flex: 1;
      min-width: 0;
    }
    .card {
      display: inline-block;
      padding: 6px 10px;
      line-height: 20px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border-radius: 4px;
      border: 1px solid #ccc;
      background-color: #f2f2f2;
      margin-left: 5px;
      margin-bottom: 5px;
      position: relative;
      cursor: pointer;
      white-space: normal;
      word-break: break-word;
      &:hover {
        &::before {
          content: '删除';
          width: 100%;
          height: 100%;
          background-color: #ccc;
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
