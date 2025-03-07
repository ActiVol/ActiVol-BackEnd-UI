<template>
    <div class="app-container">
        <el-form :model="queryParams" ref="queryForm" size="small" :inline="true" v-show="showSearch"
                 label-width="68px">
                        <el-form-item label="用户账号" prop="userName">
                            <el-input
                                    v-model="queryParams.userName"
                                    placeholder="请输入用户账号"
                                    clearable
                                    @keyup.enter="handleQuery"
                            />
                        </el-form-item>
                        <el-form-item label="用户邮箱" prop="email">
                            <el-input
                                    v-model="queryParams.email"
                                    placeholder="请输入用户邮箱"
                                    clearable
                                    @keyup.enter="handleQuery"
                            />
                        </el-form-item>
                        <el-form-item label="活动名称" prop="activityName">
                            <el-input
                                    v-model="queryParams.activityName"
                                    placeholder="请输入活动名称"
                                    clearable
                                    @keyup.enter="handleQuery"
                            />
                        </el-form-item>
                        <el-form-item label="服务领域" prop="serviceField">
                            <el-select v-model="queryParams.serviceField" placeholder="请选择服务领域"
                                       clearable>
                                <el-option
                                        v-for="dict in dict.type.service_field"
                                        :key="dict.value"
                                        :label="dict.label"
                                        :value="dict.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="服务对象" prop="serviceObject">
                            <el-select v-model="queryParams.serviceObject" placeholder="请选择服务对象"
                                       clearable>
                                <el-option
                                        v-for="dict in dict.type.service_object"
                                        :key="dict.value"
                                        :label="dict.label"
                                        :value="dict.value"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="服务场所" prop="serviceLocation">
                            <el-select v-model="queryParams.serviceLocation" placeholder="请选择服务场所"
                                       clearable>
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

        <el-row :gutter="10" class="mb8">
            <el-col :span="1.5">
                <el-button
                        type="danger"
                        plain
                        icon="el-icon-delete"
                        size="mini"
                        :disabled="multiple"
                        @click="handleDelete"
                        v-hasPermi="['volunteer:tempActivity:remove']"
                >删除
                </el-button>
            </el-col>
            <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>

        <el-table v-loading="loading" :data="tempActivityList" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55" align="center"/>
                    <el-table-column label="主键" align="center" prop="id"/>
                    <el-table-column label="用户账号" align="center" prop="userName"/>
                    <el-table-column label="用户邮箱" align="center" prop="email"/>
                    <el-table-column label="内部邮箱" align="center" prop="insideEmail"/>
                    <el-table-column label="学号" align="center" prop="studentId"/>
                    <el-table-column label="毕业年份" align="center" prop="graduationYear"/>
                    <el-table-column label="活动名称" align="center" prop="activityName"/>
                    <el-table-column label="活动地址" align="center" prop="address"/>
                    <el-table-column label="活动详情" align="center" prop="details"/>
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
                    <el-table-column label="开始时间" align="center" prop="startTime" width="180">
                        <template #default="scope">
                            <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column label="活动时长" align="center" prop="duration"/>
                    <el-table-column label="举办者名称" align="center" prop="leader"/>
                    <el-table-column label="举办者邮件" align="center" prop="leaderEmail"/>
                    <el-table-column label="对管理员的留言" align="center" prop="leaveMessage"/>
                    <el-table-column label="状态" align="center" prop="status">
                        <template #default="scope">
                                <dict-tag :options="dict.type.temp_activity_status" :value="scope.row.status"/>
                        </template>
                    </el-table-column>
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">

                    <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-s-promotion"
                            @click="processTempActivity(scope.row.id)"
                            v-if="scope.row.status==='1'"
                            v-hasPermi="['volunteer:tempActivity:edit']"
                    >审核
                    </el-button>
                    <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-edit"
                            @click="handleUpdate(scope.row)"
                            v-if="scope.row.status==='1'"
                            v-hasPermi="['volunteer:tempActivity:edit']"
                    >修改
                    </el-button>
                    <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-delete"
                            @click="handleDelete(scope.row)"
                            v-if="scope.row.status==='1'"
                            v-hasPermi="['volunteer:tempActivity:remove']"
                    >删除
                    </el-button>
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

        <!-- 添加或修改临时活动对话框 -->
        <el-dialog :title="title" v-model="open" width="500px" append-to-body>
            <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                                <el-form-item label="用户账号" prop="userName">
                                    <el-input v-model="form.userName" placeholder="请输入用户账号"/>
                                </el-form-item>
                                <el-form-item label="用户邮箱" prop="email">
                                    <el-input v-model="form.email" placeholder="请输入用户邮箱"/>
                                </el-form-item>
                                <el-form-item label="内部邮箱" prop="insideEmail">
                                    <el-input v-model="form.insideEmail" placeholder="请输入内部邮箱"/>
                                </el-form-item>
                                <el-form-item label="学号" prop="studentId">
                                    <el-input v-model="form.studentId" placeholder="请输入学号"/>
                                </el-form-item>
                                <el-form-item label="毕业年份" prop="graduationYear">
                                    <el-input v-model="form.graduationYear" placeholder="请输入毕业年份"/>
                                </el-form-item>
                                <el-form-item label="达标时长" prop="durationOfQualify">
                                    <el-input v-model="form.durationOfQualify" placeholder="请输入达标时长"/>
                                </el-form-item>
                                <el-form-item label="活动名称" prop="activityName">
                                    <el-input v-model="form.activityName" placeholder="请输入活动名称"/>
                                </el-form-item>
                                <el-form-item label="活动地址" prop="address">
                                    <el-input v-model="form.address" placeholder="请输入活动地址"/>
                                </el-form-item>
                                <el-form-item label="活动详情" prop="details">
                                    <el-input v-model="form.details" type="textarea" placeholder="请输入内容"/>
                                </el-form-item>
                                <el-form-item label="活动图片" prop="activityPictures">
                                    <image-upload v-model="form.activityPictures"/>
                                </el-form-item>
                                <el-form-item label="服务领域" prop="serviceField">
                                    <el-select v-model="form.serviceField" placeholder="请选择服务领域">
                                        <el-option
                                                v-for="dict in dict.type.service_field"
                                                :key="dict.value"
                                                :label="dict.label"
                                                :value="dict.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="服务对象" prop="serviceObject">
                                    <el-select v-model="form.serviceObject" placeholder="请选择服务对象">
                                        <el-option
                                                v-for="dict in dict.type.service_object"
                                                :key="dict.value"
                                                :label="dict.label"
                                                :value="dict.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="服务场所" prop="serviceLocation">
                                    <el-select v-model="form.serviceLocation" placeholder="请选择服务场所">
                                        <el-option
                                                v-for="dict in dict.type.service_location"
                                                :key="dict.value"
                                                :label="dict.label"
                                                :value="dict.value"
                                        ></el-option>
                                    </el-select>
                                </el-form-item>
                                <el-form-item label="开始时间" prop="startTime">
                                    <el-date-picker clearable
                                                    v-model="form.startTime"
                                                    type="date"
                                                    value-format="yyyy-MM-dd"
                                                    placeholder="请选择开始时间">
                                    </el-date-picker>
                                </el-form-item>
                                <el-form-item label="活动时长" prop="duration">
                                    <el-input v-model="form.duration" placeholder="请输入活动时长"/>
                                </el-form-item>
                                <el-form-item label="举办者名称" prop="leader">
                                    <el-input v-model="form.leader" placeholder="请输入举办者名称"/>
                                </el-form-item>
                                <el-form-item label="举办者邮件" prop="leaderEmail">
                                    <el-input v-model="form.leaderEmail" placeholder="请输入举办者邮件"/>
                                </el-form-item>
                                <el-form-item label="对管理员的留言" prop="leaveMessage">
                                    <el-input v-model="form.leaveMessage" type="textarea" placeholder="请输入内容"/>
                                </el-form-item>
                                <el-form-item label="状态" prop="status">
                                    <el-radio-group v-model="form.status">
                                        <el-radio
                                                v-for="dict in dict.type.temp_activity_status"
                                                :key="dict.value"
                                                :label="dict.value"
                                        >{{dict.label}}
                                        </el-radio>
                                    </el-radio-group>
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
import { listTempActivity, getTempActivity, delTempActivity, addTempActivity, updateTempActivity,processTempActivity
     } from "@/api/volunteer/tempActivity";

export default {
  name: "TempActivity",
  dicts: ['service_location', 'service_field', 'service_object', 'temp_activity_status'],
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
      // 临时活动表格数据
      tempActivityList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        userName: null,
        email: null,
        activityName: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    processTempActivity(id){
      this.loading = true;
      processTempActivity(id).then(response => {
        this.getList();
        this.loading = false;
      });
    },
    /** 查询临时活动列表 */
    getList() {
      this.loading = true;
      listTempActivity(this.queryParams).then(response => {
        this.tempActivityList = response.rows;
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
        id: null,
        userName: null,
        email: null,
        insideEmail: null,
        studentId: null,
        graduationYear: null,
        durationOfQualify: null,
        activityName: null,
        address: null,
        details: null,
        activityPictures: null,
        serviceField: null,
        serviceObject: null,
        serviceLocation: null,
        startTime: null,
        duration: null,
        leader: null,
        leaderEmail: null,
        leaveMessage: null,
        status: null
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加临时活动";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getTempActivity(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改临时活动";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
            updateTempActivity(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addTempActivity(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除临时活动编号为"' + ids + '"的数据项？').then(function() {
        return delTempActivity(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('volunteer/tempActivity/export', {
        ...this.queryParams
      }, `tempActivity_${new Date().getTime()}.xlsx`)
    }
  }
};

</script>
