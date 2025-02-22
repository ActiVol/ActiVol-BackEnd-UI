<template>
  <div class="app-container" ref="appContainer">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="图片名" prop="fileName">
        <el-input v-model="queryParams.fileName" placeholder="请输入图片名" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="创建时间">
        <el-date-picker v-model="dateRange" style="width: 240px" value-format="yyyy-MM-dd" type="daterange" range-separator="-" start-placeholder="开始日期" end-placeholder="结束日期" ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
      <el-form-item style="float:right">
        <div class="qiehuan" @click="handleActivity">
          <i class="el-icon-s-grid" :style="activity ? 'color:#389dfd' : 'color:#000000'"></i>
        </div>
      </el-form-item>
    </el-form>
    <div class="view-container">
      <!-- Table view -->
      <el-table ref="table" v-if="!activity" v-loading="loading" :data="fileList">
        <el-table-column label="预览图" align="center" prop="url" width="100">
          <template slot-scope="scope">
            <image-preview :src="scope.row.url" :width="'50px'" :height="'50px'" />
          </template>
        </el-table-column>
        <el-table-column label="图片名" align="center" prop="fileName" />
        <el-table-column label="活动名称" align="center" prop="fileName">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.activityName">
              {{ scope.row.activityName&&scope.row.activityName.length>10?scope.row.activityName.substring(0,10)+'...' : scope.row.activityName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="图片类型" align="center" prop="type" />
        <el-table-column label="图片大小" align="center" prop="size">
          <template slot-scope="scope">
            {{ formatFileSize(scope.row.size) }}
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['volunteer:info:remove']"
            v-if="!scope.row.activityName"
          >删除</el-button>
        </template>
      </el-table-column>
      </el-table>
      <!-- Grap view - 九宫格 -->
      <div class="content-grap" v-else :style="{height: clientHeight}">
        <div class="grid-container">
          <div class="item" v-for="(item, index) in fileList" :key="index">
            <image-preview :src="item.url" :width="'100px'" :height="'100px'" style="display:block"/>
            <div class="name" :title="item.fileName">{{ item.fileName.length > 10 ? item.fileName.slice(0, 10) + '...' : item.fileName }}</div>
            <div v-if="item.activityName&&item.activityName.length" class="activity-name" :title="item.activityName">
              <el-tag>{{ item.activityName&&item.activityName.length > 5 ? item.activityName.slice(0, 5) + '...' : item.activityName }}</el-tag>
            </div>
            <div class="time">{{ parseTime(item.createTime) }}</div>
          </div>
        </div>
      </div>
    </div>
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />
  </div>
</template>

<script>
import { listFile,delFile } from "@/api/volunteer/file";
import config from "config";

export default {
  name: "File",
  data() {
    return {
      loading: false,
       // 显示搜索条件
       showSearch: true,
      fileList: [],
      dateRange: [],
      // 总条数
      total: 0,
      queryParams: { pageNum: 1, pageSize: 6, fileName: null,orderByColumn:'fileId' },
      baseUrl: config.baseURL,
      activity: false,
      noMoreData: false,  // 标识是否有更多数据
      clientHeight:400,
    };
  },
  created() {
    this.getList();
  },
  mounted(){
    this.clientHeight = this.$refs.appContainer.parentElement.clientHeight-150;
  },
  methods: {
    handleActivity(){
      this.queryParams.pageSize=this.activity?6:24;
      this.queryParams.pageNum = 1;
      this.getList();
      this.activity = !this.activity;
    },
    getList() {
      this.loading = true;
      listFile(this.addDateRange(this.queryParams, this.dateRange)).then(response => {
        this.fileList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.fileList = [];
      this.noMoreData = false;
      this.getList();
    },
    resetQuery() {
      this.dateRange = [];
      this.resetForm("queryForm");
      this.handleQuery();
    },
    formatFileSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
      else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + " MB";
      else return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const fileIds = row.fileId ;
      this.$modal.confirm('是否确认删除活动信息编号为"' + fileIds + '"的数据项？').then(function() {
        return delFile(fileIds);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    parseTime(timestamp) {
      const date = new Date(timestamp);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `${month}/${day} ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    }
  }
};
</script>
<style scoped>
.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.grid-container {
  display: grid;
  grid-template-columns:repeat(auto-fill, minmax(120px, 1fr));  /* Adjust the number of columns as needed */
  gap: 10px;
}

.item {
  text-align: center;
  place-items: center;
  display: grid;
}

.name {
  margin-top: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(37, 38, 43);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  overflow-wrap: break-word;
  margin-bottom: 2px;
  -webkit-transition: color .3s ease;
  transition: color .3s ease;
}

.time {
  margin-top: 4px;
  max-width: 100px;
  text-align: center;
  font-size: 12px;
  line-height: 1.6;
  color: rgba(37, 38, 43, 0.36);
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>


