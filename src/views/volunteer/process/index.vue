<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="活动名称" prop="activityName">
        <el-input
          v-model="queryParams.activityName"
          placeholder="请输入活动名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="活动地址" prop="address">
        <el-input
          v-model="queryParams.address"
          placeholder="请输入活动地址"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="服务领域" prop="serviceField">
        <el-select v-model="queryParams.serviceField" placeholder="请选择服务领域" clearable>
          <el-option
            v-for="dict in dict.type.service_field"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="服务对象" prop="serviceObject">
        <el-select v-model="queryParams.serviceObject" placeholder="请选择服务对象" clearable>
          <el-option
            v-for="dict in dict.type.service_object"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="服务场所" prop="serviceLocation">
        <el-select v-model="queryParams.serviceLocation" placeholder="请选择服务场所" clearable>
          <el-option
            v-for="dict in dict.type.service_location"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>
    <el-table v-loading="loading" :data="infoList">
      <el-table-column label="活动名称" width="200" show-overflow-tooltip align="center" prop="activityName" />
      <el-table-column label="活动地址" show-overflow-tooltip align="center" prop="address" />
      <el-table-column label="活动时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="活动图片" align="center" prop="activityPictures" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.activityPictures" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="服务领域" align="center" prop="serviceField">
        <template #default="scope">
          <dict-tag :options="dict.type.service_field" :value="scope.row.serviceField"/>
        </template>
      </el-table-column>
      <el-table-column label="服务对象" align="center" prop="serviceObject">
        <template #default="scope">
          <dict-tag :options="dict.type.service_object" :value="scope.row.serviceObject"/>
        </template>
      </el-table-column>
      <el-table-column label="服务场所" align="center" prop="serviceLocation">
        <template #default="scope">
          <dict-tag :options="dict.type.service_location" :value="scope.row.serviceLocation"/>
        </template>
      </el-table-column>
      <el-table-column label="发布状态" align="center" prop="publishStatus">
        <template #default="scope">
          <dict-tag :options="dict.type.publish_status" :value="scope.row.publishStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="el-icon-s-check"
            @click="handleProcess(scope.row)"
            v-hasPermi="['volunteer:info:edit']"
            v-if="scope.row.publishStatus==2"
          >审核</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改活动信息对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="活动名称">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" readonly/>
        </el-form-item>
        <el-form-item label="活动地址">
          <el-input v-model="form.address" placeholder="请输入活动地址" readonly />
        </el-form-item>
        <el-form-item label="活动详情">
          <el-input v-model="form.details" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="服务领域">
          <el-select v-model="form.serviceField" placeholder="请选择服务领域" style="width: 100%;" >
            <el-option
              v-for="dict in dict.type.service_field"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务对象">
          <el-select v-model="form.serviceObject" placeholder="请选择服务对象" style="width: 100%;">
            <el-option
              v-for="dict in dict.type.service_object"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务场所">
          <el-select v-model="form.serviceLocation" placeholder="请选择服务场所" style="width: 100%;" >
            <el-option
              v-for="dict in dict.type.service_location"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
              disabled
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker clearable
            v-model="form.startTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择开始时间"
            style="width: 100%;"
            disabled
            >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker clearable
            v-model="form.endTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择结束时间"
            style="width: 100%;"
            disabled
            >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="审核状态" prop="reviewStatus">
          <el-radio-group v-model="form.reviewStatus">
            <el-radio
              v-for="dict in dict.type.review_status"
              :key="dict.value"
              :label="dict.value"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="审核意见">
          <el-input v-model="form.reviewComments" type="textarea"/>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { processListInfo, getInfo, addInfo, updateInfo } from "@/api/volunteer/info";
import { processActivity } from "@/api/volunteer/process";

export default {
  name: "Info",
  dicts: ['service_location', 'publish_status', 'service_field', 'service_object','review_status'],
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 活动信息表格数据
      infoList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        activityName: null,
        address: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        reviewStatus: [
            { required: true, message: '请选择审核状态', trigger: 'change' }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /**
     * 审核按钮
     */
    handleProcess(row){
      this.reset();
      const activityId = row.activityId;
      getInfo(activityId).then(response => {
        let {activityId,activityName,address,details,serviceField,serviceObject,serviceLocation,startTime,endTime} = response.data;
        this.form={
          activityId,activityName,address,details,serviceField,serviceObject,serviceLocation,startTime,endTime,reviewStatus:'1',reviewComments:null
        }
        this.open = true;
        this.title = "审核发布活动";
      });
    },
    /** 查询活动信息列表 */
    getList() {
      this.loading = true;
      processListInfo(this.queryParams).then(response => {
        this.infoList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        activityId: null,
        activityName: null,
        address: null,
        recruitNumber: null,
        details: null,
        activityPictures: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
        startTime: null,
        endTime: null,
        reviewStatus: null,
        reviewComments:null
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          let {activityId,reviewStatus,reviewComments} = this.form;
          let param={activityId,reviewStatus,reviewComments};
          processActivity(param).then(response => {
            this.$modal.msgSuccess("审核成功");
            this.open = false;
            this.getList();
          });
        }
      });
    },
  }
};
</script>
