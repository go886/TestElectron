<template>
    <el-dialog class="root" title="提示" :visible.sync="value"  size="large" :modal="false" modal-append-to-body="false">
        <!-- {{value}} -->
        <el-form :model="value"  label-position="left"  label-width="80px">
            <el-form-item label="显示名称">
                <el-input v-model="value.name" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="路径">
                <el-input v-model="value.path" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="图标">
                <img :src="value.icon" />
            </el-form-item>
            <el-form-item label="执行文件">
                <el-input v-model="value.exec" auto-complete="off"></el-input>
            </el-form-item>
            <el-form-item label="描述">
                <el-input v-model="value.desc" auto-complete="off"></el-input>
            </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
            <el-button @click="dialogFormVisible = false">取 消</el-button>
            <el-button type="primary" @click="dialogFormVisible = false">保 存</el-button>
        </div>
    </el-dialog>
</template>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
   
   
</style>


<script>
    export default {
        props: ["value"],
        data() {
            return {
                dialogVisible: false
            };
        },
        computed: {

        },
        created() {

        },
        methods: {
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => { });
            }
        }
    }

</script>