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
        <el-select v-model="queryParams.serviceField" placeholder="请选择服务领域" clearable style="width: 100px">
          <el-option
            v-for="dict in service_field"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="服务对象" prop="serviceObject">
        <el-select v-model="queryParams.serviceObject" placeholder="请选择服务对象" clearable style="width: 100px">
          <el-option
            v-for="dict in service_object"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="服务场所" prop="serviceLocation">
        <el-select v-model="queryParams.serviceLocation" placeholder="请选择服务场所" clearable style="width: 100px">
          <el-option
            v-for="dict in service_location"
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

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          size="mini"
          @click="handleAdd"
          v-hasPermi="['volunteer:info:add']"
        >新增</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>
    <el-table v-loading="loading" :data="infoList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
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
          <dict-tag :options="service_field" :value="scope.row.serviceField"/>
        </template>
      </el-table-column>
      <el-table-column label="服务对象" align="center" prop="serviceObject">
        <template #default="scope">
          <dict-tag :options="service_object" :value="scope.row.serviceObject"/>
        </template>
      </el-table-column>
      <el-table-column label="服务场所" align="center" prop="serviceLocation">
        <template #default="scope">
          <dict-tag :options="service_location" :value="scope.row.serviceLocation"/>
        </template>
      </el-table-column>
      <el-table-column label="活动状态" align="center" prop="activityStatus">
        <template #default="scope">
          <dict-tag :options="activity_status" :value="scope.row.activityStatus"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            size="mini"
            type="text"
            icon="Position"
            @click="handlePublish(scope.row)"
            v-hasPermi="['volunteer:info:edit']"
            v-if="scope.row.activityStatus==3||scope.row.activityStatus==4"
          >发布</el-button>
          <el-button
            size="mini"
            type="text"
            icon="Edit"
            @click="handleUpdate(scope.row)"
            v-hasPermi="['volunteer:info:edit']"
            v-if="scope.row.activityStatus==3||scope.row.activityStatus==4"
          >修改</el-button>
          <el-button
            size="mini"
            type="text"
            icon="Delete"
            @click="handleDelete(scope.row)"
            v-hasPermi="['volunteer:info:remove']"
            v-if="scope.row.activityStatus==3"
          >删除</el-button>
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
        <el-form-item label="活动名称" prop="activityName">
          <el-input v-model="form.activityName" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入活动地址" />
        </el-form-item>
        <el-form-item label="招募人数" prop="recruitNumber">
          <el-input v-model="form.recruitNumber" placeholder="请输入招募人数" />
        </el-form-item>
        <el-form-item label="活动详情" prop="details">
          <el-input v-model="form.details" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="活动图片" prop="activityPictures">
          <image-upload ref="imageUpload" v-model="form.activityPictures" :limit="1"/>
        </el-form-item>
        <el-form-item label="服务领域" prop="serviceField">
          <el-select v-model="form.serviceField" placeholder="请选择服务领域" style="width: 100%;">
            <el-option
              v-for="dict in service_field"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务对象" prop="serviceObject">
          <el-select v-model="form.serviceObject" placeholder="请选择服务对象" style="width: 100%;">
            <el-option
              v-for="dict in service_object"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="服务场所" prop="serviceLocation">
          <el-select v-model="form.serviceLocation" placeholder="请选择服务场所" style="width: 100%;">
            <el-option
              v-for="dict in service_location"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="datetime"
            value-format="yyyy-MM-dd"
            placeholder="请选择开始时间"
            style="width: 100%;">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="datetime"
            value-format="yyyy-MM-dd"
            placeholder="请选择结束时间"
            style="width: 100%;">
          </el-date-picker>
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
// import { listInfo, getInfo, delInfo, addInfo, updateInfo,publishInfo } from "@/api/volunteer/info";
// export default {
//   name: "Info",
//   dicts: ['service_location', 'activity_status', 'service_field', 'service_object'],
//   data() {
//     return {
//       // 遮罩层
//       loading: true,
//       // 选中数组
//       ids: [],
//       // 非单个禁用
//       single: true,
//       // 非多个禁用
//       multiple: true,
//       // 显示搜索条件
//       showSearch: true,
//       // 总条数
//       total: 0,
//       // 活动信息表格数据
//       infoList: [],
//       // 弹出层标题
//       title: "",
//       // 是否显示弹出层
//       open: false,
//       // 查询参数
//       queryParams: {
//         pageNum: 1,
//         pageSize: 10,
//         activityName: null,
//         address: null,
//         serviceField: null,
//         serviceObject: null,
//         serviceLocation: null,
//       },
//       // 表单参数
//       form: {},
//       // 表单校验
//       rules: {
//       }
//     };
//   },
//   created() {
//     this.getList();
//   },
//   methods: {
//     /**
//      * 发布活动
//      * @param {活动对象} data
//      */
//     handlePublish(data){
//       let {activityId} = data;
//       publishInfo(activityId).then(response=>{
//         this.getList();
//         this.$modal.msgSuccess("发布成功");
//       })
//     },
//     /** 查询活动信息列表 */
//     getList() {
//       this.loading = true;
//       listInfo(this.queryParams).then(response => {
//         this.infoList = response.rows;
//         this.total = response.total;
//         this.loading = false;
//       });
//     },
//     // 取消按钮
//     cancel() {
//       this.open = false;
//       this.reset();
//     },
//     // 表单重置
//     reset() {
//       this.form = {
//         activityId: null,
//         activityName: null,
//         address: null,
//         recruitNumber: null,
//         details: null,
//         activityPictures: null,
//         serviceField: null,
//         serviceObject: null,
//         serviceLocation: null,
//         startTime: null,
//         endTime: null,
//       };
//       this.proxy.resetForm("form");
//     },
//     /** 搜索按钮操作 */
//     handleQuery() {
//       this.queryParams.pageNum = 1;
//       this.getList();
//     },
//     /** 重置按钮操作 */
//     resetQuery() {
//       this.proxy.resetForm("queryForm");
//       this.handleQuery();
//     },
//     // 多选框选中数据
//     handleSelectionChange(selection) {
//       this.ids = selection.map(item => item.activityId)
//       this.single = selection.length!==1
//       this.multiple = !selection.length
//     },
//     /** 新增按钮操作 */
//     handleAdd() {
//       this.reset();
//       this.open = true;
//       this.title = "添加活动信息";
//     },
//     /** 修改按钮操作 */
//     handleUpdate(row) {
//       this.reset();
//       const activityId = row.activityId || this.ids
//       getInfo(activityId).then(response => {
//         this.form = response.data;
//         this.open = true;
//         this.title = "修改活动信息";
//       });
//     },
//     /** 提交按钮 */
//     submitForm() {
//       let that = this;
//       this.$refs["form"].validate(valid => {
//         if (valid) {
//           let fileArray = that.$refs.imageUpload.fileArray;
//           let fileId =  fileArray&&fileArray.length?fileArray[0].fileId:'';
//           that.form['fileId'] = fileId;
//           if (this.form.activityId != null) {
//             updateInfo(that.form).then(response => {
//               that.$modal.msgSuccess("修改成功");
//               that.open = false;
//               that.getList();
//             });
//           } else {
//             addInfo(this.form).then(response => {
//               this.$modal.msgSuccess("新增成功");
//               this.open = false;
//               this.getList();
//             });
//           }
//         }
//       });
//     },
//     /** 删除按钮操作 */
//     handleDelete(row) {
//       const activityIds = row.activityId || this.ids;
//       this.$modal.confirm('是否确认删除活动信息编号为"' + activityIds + '"的数据项？').then(function() {
//         return delInfo(activityIds);
//       }).then(() => {
//         this.getList();
//         this.$modal.msgSuccess("删除成功");
//       }).catch(() => {});
//     },
//     /** 导出按钮操作 */
//     handleExport() {
//       this.download('volunteer/info/export', {
//         ...this.queryParams
//       }, `info_${new Date().getTime()}.xlsx`)
//     }
//   }
// };
</script>
<script setup>
import { listInfo, getInfo, delInfo, addInfo, updateInfo, publishInfo } from '@/api/volunteer/info';
import { ref, reactive, onMounted,getCurrentInstance } from 'vue';
const { proxy } = getCurrentInstance();
const { service_location, activity_status, service_field, service_object} = proxy.useDict('service_location', 'activity_status', 'service_field', 'service_object');

// 定义响应式数据
const loading = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const showSearch = ref(true);
const total = ref(0);
const infoList = ref([]);
const title = ref('');
const open = ref(false);

// 定义查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  activityName: null,
  address: null,
  serviceField: null,
  serviceObject: null,
  serviceLocation: null
});

// 表单和验证规则
const form = reactive({
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
  endTime: null
});
const rules = reactive({});

// 创建时获取列表数据
onMounted(() => {
  getList();
});

// 获取活动信息列表
const getList = () => {
  loading.value = true;
  listInfo(queryParams).then(response => {
    infoList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
};

// 取消操作
const cancel = () => {
  open.value = false;
  reset();
};

// 重置表单
const reset = () => {
  Object.keys(form).forEach(key => form[key] = null);
  proxy.resetForm("form");
};

// 查询处理
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置查询条件
const resetQuery = () => {
  proxy.resetForm("queryForm");
  handleQuery();
};

// 处理选择变化
const handleSelectionChange = (selection) => {
  ids.value = selection.map(item => item.activityId);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

// 添加活动
const handleAdd = () => {
  reset();
  open.value = true;
  title.value = "添加活动信息";
};

// 更新活动
const handleUpdate = (row) => {
  reset();
  const activityId = row.activityId || ids.value;
  getInfo(activityId).then(response => {
    form = { ...response.data }; 
    open.value = true;
    title.value = "修改活动信息";
  });
};

// 提交表单
const submitForm = () => {
  const fileArray = proxy.$refs.imageUpload.fileArray;
  const fileId = fileArray && fileArray.length ? fileArray[0].fileId : "";
  form.fileId = fileId;
  
  if (form.activityId != null) {
    updateInfo(form).then(() => {
      $modal.msgSuccess("修改成功");
      open.value = false;
      getList();
    });
  } else {
    addInfo(form).then(() => {
      $modal.msgSuccess("新增成功");
      open.value = false;
      getList();
    });
  }
};

// 删除活动
const handleDelete = (row) => {
  const activityIds = row.activityId || ids.value;
  $modal.confirm(`是否确认删除活动信息编号为"${activityIds}"的数据项？`).then(() => {
    return delInfo(activityIds);
  }).then(() => {
    getList();
    $modal.msgSuccess("删除成功");
  }).catch(() => {});
};


// 用于发布活动
const handlePublish = (data) => {
  const { activityId } = data;
  publishInfo(activityId).then(() => {
    getList();
    $modal.msgSuccess("发布成功");
  });
};
</script>
