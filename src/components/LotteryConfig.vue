<template>
  <el-dialog
    :visible="visible"
    :append-to-body="true"
    width="390px"
    @close="$emit('update:visible', false)"
    class="c-LotteryConfig"
  >
    <div class="c-LotteryConfigtitle" slot="title">
      <span :style="{ fontSize: '16px', marginRight: '20px' }">
        抽奖配置
      </span>
      <el-button size="mini" @click="addLottery">增加奖项</el-button>
      <el-button size="mini" type="primary" @click="onSubmit"
        >保存配置</el-button
      >
      <el-button size="mini" @click="$emit('update:visible', false)"
        >取消</el-button
      >
    </div>
    <div class="container">
      <el-form ref="form" :model="form" size="mini">
        <el-form-item label="抽奖标题">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
        <el-form-item label="抽奖总人数">
          <el-input
            type="number"
            v-model="form.number"
            :min="1"
            :step="1"
          ></el-input>
        </el-form-item>
        <el-form-item label="奖项设置">
          <div class="prize-list">
            <div class="prize-row" v-for="item in prizeList" :key="item.key">
              <el-input
                class="prize-name"
                size="mini"
                v-model="prizeNames[item.key]"
                placeholder="奖项名称"
              ></el-input>
              <el-input
                class="prize-qty"
                size="mini"
                type="number"
                :min="0"
                :step="1"
                v-model="form[item.key]"
                @change="
                  val => {
                    form[item.key] = Number(val);
                  }
                "
              ></el-input>
              <el-button
                class="prize-del"
                size="mini"
                type="danger"
                plain
                @click="removePrize(item.key)"
                >删除</el-button
              >
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <el-dialog
      :visible.sync="showAddLottery"
      :append-to-body="true"
      width="300px"
      class="dialog-showAddLottery"
    >
      <div class="add-title" slot="title">增加奖项</div>
      <el-form ref="newLottery" :model="newLottery" size="mini">
        <el-form-item label="奖项名称">
          <el-input v-model="newLottery.name"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="addHandler">增加奖项</el-button>
          <el-button @click="showAddLottery = false">取消</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </el-dialog>
</template>
<script>
import { setData, configField, newLotteryField, getData } from '@/helper/index';
import { randomNum } from '@/helper/algorithm';
export default {
  name: 'LotteryConfig',
  props: {
    visible: Boolean
  },
  computed: {
    form: {
      get() {
        return this.$store.state.config;
      },
      set(val) {
        // this.$store.commit('setConfig', val);
        return val;
      }
    },
    storeNewLottery() {
      return this.$store.state.newLottery;
    },
    prizeList() {
      const list = [];
      const hasFirstPrize =
        Object.prototype.hasOwnProperty.call(this.form, 'firstPrize') ||
        (this.storeNewLottery || []).some(item => item.key === 'firstPrize');
      if (hasFirstPrize) {
        list.push({ key: 'firstPrize' });
      }
      return list.concat(
        (this.storeNewLottery || []).filter(item => item.key !== 'firstPrize')
      );
    }
  },
  data() {
    return {
      showAddLottery: false,
      newLottery: { name: '' },
      prizeNames: {}
    };
  },
  created() {
    this.initPrizeNames();
  },
  watch: {
    visible(v) {
      if (v) {
        this.initPrizeNames();
      }
    },
    storeNewLottery: {
      deep: true,
      handler() {
        this.initPrizeNames();
      }
    }
  },
  methods: {
    initPrizeNames() {
      const names = {};
      const newLottery = getData(newLotteryField) || this.storeNewLottery || [];
      if (
        Object.prototype.hasOwnProperty.call(this.form, 'firstPrize') ||
        newLottery.some(item => item.key === 'firstPrize')
      ) {
        const first = newLottery.find(item => item.key === 'firstPrize');
        names.firstPrize = first ? first.name : '一等奖';
      }
      newLottery
        .filter(item => item && item.key && item.key !== 'firstPrize')
        .forEach(item => {
          names[item.key] = item.name;
        });
      this.prizeNames = names;
    },
    onSubmit() {
      // Persist prize names (including firstPrize rename)
      this.prizeList.forEach(item => {
        const key = item.key;
        const name = (this.prizeNames[key] || '').trim();
        if (name) {
          this.$store.commit('upsertLotteryMeta', { key, name });
        }
      });
      setData(configField, this.form);
      this.$store.commit('setConfig', this.form);
      this.$emit('update:visible', false);

      this.$message({
        message: '保存成功',
        type: 'success'
      });

      this.$nextTick(() => {
        this.$emit('resetconfig');
      });
    },
    addLottery() {
      this.showAddLottery = true;
    },
    randomField() {
      const str = 'abcdefghijklmnopqrstuvwxyz';
      let fieldStr = '';
      for (let index = 0; index < 10; index++) {
        fieldStr += str.split('')[randomNum(1, 27) - 1];
      }
      return `${fieldStr}${Date.now()}`;
    },
    addHandler() {
      const field = this.randomField();
      const data = {
        key: field,
        name: this.newLottery.name
      };
      this.$store.commit('setNewLottery', data);
      if (typeof this.form[field] === 'undefined') {
        this.$set(this.form, field, 0);
      }

      this.showAddLottery = false;
    },
    removePrize(key) {
      this.$confirm(
        '此操作将删除该奖项（同时会移除该奖项已有的抽奖结果），确认删除?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => {
          this.$store.commit('removeLottery', key);
          this.$message({
            type: 'success',
            message: '删除成功!'
          });
          this.$nextTick(() => {
            this.$emit('resetconfig');
          });
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="scss">
.c-LotteryConfig {
  .el-dialog__body {
    height: 340px;
    .container {
      height: 100%;
      overflow-y: auto;
      padding: 0 10px;
    }
    .prize-list {
      width: 100%;
      .prize-row {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        .prize-name {
          flex: 1;
          margin-right: 8px;
        }
        .prize-qty {
          width: 90px;
          margin-right: 8px;
        }
        .prize-del {
          flex: 0 0 auto;
        }
      }
    }
  }
}
.dialog-showAddLottery {
  .el-dialog {
    height: 186px;
  }
}
</style>
