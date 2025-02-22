<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="6" :xs="24">
        <el-card class="box-card">
          <div slot="header" class="clearfix">
            <div class="text-center">
              <userAvatar />
            </div>
          </div>
          <div>
            <!-- <el-tabs v-model="activeTabLeft">
              <el-tab-pane label="用户信息" name="userInfo">

              </el-tab-pane>
              <el-tab-pane label="活动信息" name="activityInfo">

              </el-tab-pane>
            </el-tabs> -->
            <div class="container">
                <ul class="list-group list-group-striped">
                  <li class="list-group-item">
                    <svg-icon icon-class="user" />用户名称
                    <div class="pull-right">{{ user.userName }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="peoples" />角色组
                    <div class="pull-right">{{ roleGroup }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="graduation-year" icon-class="graduation-year"/>毕业年份
                    <div class="pull-right">{{ user.graduationYear }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="duration-of-qualify" icon-class="duration-of-qualify"/>达标时长
                    <div class="pull-right">{{ user.durationOfQualify }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="email" />内部邮箱
                    <div class="pull-right">{{ user.insideEmail }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon icon-class="email" />外部邮箱
                    <div class="pull-right">{{ user.externalEmail }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="ic_leader" icon-class="ic_leader" />辅导员
                    <div class="pull-right">{{ user.instructor }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="login-ip" icon-class="login-ip" />登录IP
                    <div class="pull-right">{{ user.loginIp }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="create-time" icon-class="create-time" />登录时间
                    <div class="pull-right">{{ user.loginDate }}</div>
                  </li>
                  <li class="list-group-item">
                    <svg-icon class-name="create-time" icon-class="create-time" />注册时间
                    <div class="pull-right">{{ user.createTime }}</div>
                  </li>
                </ul>
              </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="18" :xs="24">
        <el-card>
          <div slot="header" class="clearfix">
            <span>基本资料</span>
          </div>
          <el-tabs v-model="activeTabRight">
            <el-tab-pane label="基本资料" name="userinfo">
              <userInfo :user="user" />
            </el-tab-pane>
            <el-tab-pane label="修改密码" name="resetPwd">
              <resetPwd />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import userAvatar from "./userAvatar";
import userInfo from "./userInfo";
import resetPwd from "./resetPwd";
import { getUserProfile } from "@/api/system/user";

export default {
  name: "Profile",
  components: { userAvatar, userInfo, resetPwd },
  data() {
    return {
      user: {},
      roleGroup: {},
      postGroup: {},
      activeTabLeft: "userInfo",
      activeTabRight: "userinfo",
      userInfo:{},
    };
  },
  created() {
    this.getUser();
  },
  methods: {
    getUser() {
      getUserProfile().then(response => {
        this.user = response.user;
        this.roleGroup = response.roleGroup;
        this.postGroup = response.postGroup;
      });
    }
  }
};
</script>
