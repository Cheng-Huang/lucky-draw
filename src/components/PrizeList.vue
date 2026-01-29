<template>
  <el-dialog
    :visible="visible"
    :fullscreen="true"
    :append-to-body="true"
    class="c-PrizeList"
    @close="$emit('update:visible', false)"
  >
    <div class="dialog-title" slot="title">
      <span class="title">奖品清单</span>
      <span class="subtitle">共 {{ totalCount }} 份</span>
    </div>

    <div class="content" :style="{ columnCount: columnCount }">
      <div class="group" v-for="group in groupedPrizes" :key="group.level">
        <div class="group-title">{{ group.level }}</div>
        <div class="items">
          <div class="item" v-for="item in group.items" :key="item.key">
            <div class="name">{{ item.prizeName }}</div>
            <div class="count">× {{ item.count }}</div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'PrizeList',
  props: {
    visible: Boolean
  },
  computed: {
    config() {
      return this.$store.state.config || {};
    },
    newLottery() {
      return this.$store.state.newLottery || [];
    },
    prizeRows() {
      const cfg = this.config || {};
      const orderedKeys = (this.newLottery || [])
        .map(i => i.key)
        .filter(Boolean);
      const cfgKeys = Object.keys(cfg).filter(
        k => k !== 'name' && k !== 'number'
      );

      const keys = orderedKeys.concat(
        cfgKeys.filter(k => !orderedKeys.includes(k))
      );

      return keys
        .map(key => {
          const count = Number(cfg[key]);
          if (!Number.isFinite(count) || count <= 0) {
            return null;
          }

          const meta = (this.newLottery || []).find(i => i && i.key === key);
          const name =
            meta && meta.name
              ? String(meta.name).trim()
              : key === 'firstPrize'
              ? '一等奖'
              : String(key);

          return {
            key,
            name,
            count
          };
        })
        .filter(Boolean);
    },
    groupedPrizes() {
      const groups = new Map();
      for (const row of this.prizeRows) {
        const full = String(row.name || '').trim();
        const parts = full.split(' - ');
        const level = (parts[0] || full).trim();
        const prizeName = (parts.slice(1).join(' - ') || full).trim();

        if (!groups.has(level)) {
          groups.set(level, []);
        }
        groups.get(level).push({
          key: row.key,
          prizeName,
          count: row.count
        });
      }
      return Array.from(groups.entries()).map(([level, items]) => ({
        level,
        items
      }));
    },
    columnCount() {
      const n = (this.groupedPrizes || []).length;
      if (n <= 1) return 1;
      // Prefer fewer columns for small prize sets to use vertical space better on big screens.
      if (n <= 8) return 2;
      if (n <= 14) return 3;
      return 4;
    },
    totalCount() {
      return this.prizeRows.reduce((sum, item) => sum + (item.count || 0), 0);
    }
  }
};
</script>

<style lang="scss">
.c-PrizeList {
  --prize-safe-x: clamp(80px, 18vw, 680px);

  .el-dialog {
    margin: 0 !important;
    top: 0 !important;
    -webkit-transform: none !important;
    transform: none !important;
    height: 100vh;
    width: 100vw;
    max-width: 100vw;
  }
  .el-dialog__header {
    padding: 16px var(--prize-safe-x);
  }
  .el-dialog__headerbtn {
    right: var(--prize-safe-x);
  }
  .dialog-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
    .title {
      font-size: 28px;
      font-weight: 800;
    }
    .subtitle {
      font-size: 18px;
      color: #6b7280;
    }
  }
  .el-dialog__body {
    height: calc(100vh - 60px) !important;
    overflow: hidden;
    padding: 0 var(--prize-safe-x) 28px;
  }
  .content {
    height: 100%;
    width: min(1400px, 100%);
    margin: 0 auto;
    padding-top: 10px;
    column-gap: 36px;
    column-fill: balance;
    overflow: hidden;
  }
  @media (max-width: 900px) {
    .content {
      column-count: 1 !important;
    }
  }
  .group {
    break-inside: avoid;
    padding: 10px 0 6px;
    border-bottom: 1px solid rgba(17, 24, 39, 0.06);
    display: inline-block;
    width: 100%;
  }
  .group-title {
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 0.04em;
    margin-bottom: 6px;
  }
  .items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .item {
    display: grid;
    grid-template-columns: 1fr 110px;
    column-gap: 12px;
    align-items: center;
    padding: 6px 0;
  }
  .name {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
    text-align: left;
    word-break: break-word;
  }
  .count {
    font-size: 24px;
    font-weight: 900;
    text-align: left;
    white-space: nowrap;
  }
}
</style>
