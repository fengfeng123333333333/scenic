<template>
	<view class="body">
	<view class="concat">
		<view class="lis bord">
			<text class="name">类型</text>
			<view class="xuan">
				<text :class="show ==0? 'active':''" @click="show=0">个人</text>
				<text :class="show ==1? 'active':''"  @click="show=1">公司</text>
			</view>
		</view>
		<view class="lis bord" >
			<text class="name">发票抬头</text>
	  <u--input
	    placeholder="请输入发票抬头"
	    border="none"
	    v-model="info.InvoiceHeader"></u--input>
		</view>
		<view class="lis " v-if="show==1" >
					<text class="name">纳税人识别号</text>
		<u--input
		  placeholder="请输入纳税人识别号"
		  border="none"
		  v-model="info.TaxpayerNumber"></u--input>
				</view>
	</view>
	
	<view class="concat" v-if="show==1">
		<view class="lis bord" >
					<text class="name1">需要增值专用票</text>
		<u-switch class="butnb" v-model="info.NeedVatInvoice" activeColor="#5ac725"  ></u-switch>
		
	</view>
	<view class="lis " v-if="info.NeedVatInvoice" >
				<text class="name">公司地址</text>
	<u--input
	  placeholder="请输入公司地址"
	  border="none"
	  v-model="info.CompanyAddress"></u--input>
			</view>
			<view class="lis bord" v-if="info.NeedVatInvoice" >
						<text class="name">公司电话</text>
			<u--input
			  placeholder="请输入公司电话"
			  border="none"
			  v-model="info.CompanyPhone"></u--input>
					</view>
					<view class="lis bord" v-if="info.NeedVatInvoice" >
								<text class="name">开户网点</text>
					<u--input
					  placeholder="请输入开户网点"
					  border="none"
					  v-model="info.OpeningBranch"></u--input>
							</view>
							<view class="lis " v-if="info.NeedVatInvoice" >
										<text class="name">银行账号</text>
							<u--input
							  placeholder="请输入银行账号"
							  border="none"
							  v-model="info.BankAccount"></u--input>
									</view>
</view>
<view class="colo">
		<u-button type="primary" color=" #2dbb55" text="保存" @click="add()"></u-button>
</view>



	</view>
	
</template>

<script>
	export default {
		data() {
			return {
			show:0,
			info:{
				InvoiceHeader:"",
				ID:"",
				TaxpayerNumber:"",
				InvoiceType:1,
				CompanyAddress:"",
				OpeningBranch:"",
				BankAccount:"",
				CompanyPhone:"",
				NeedVatInvoice:false,
			}
			}
		},
		onLoad(option) {
			this.info.ID = (option.ID || 0) 
						if (this.info.ID > 0) {
							this._initData()
						}
			console.log(option,"!!!!!!!!")
		},
		methods:{
			async _initData(){
				let openid  = uni.getStorageSync('userinfo');
						const list = await this.$myRequest({url: '/api/Applets/AppletsGetInvoiceById',
						method:'POST',
						data:{
							  openId:openid.openid,
							  invoiceID:this.info.ID
						},
						})
							const info = list.data.Data || {}
							
							console.log(info)
							for (let key in this.info) {
								
								this.info[key] = info[key] || ''
						
					this.info['NeedVatInvoice']=info['NeedVatInvoice']
					if(this.info['NeedVatInvoice']==0){
							this.info['NeedVatInvoice']=false
					}else{
							this.info['NeedVatInvoice']=true
					}
					this.show=this.info['InvoiceType']
					}
					console.log(this.info,"????????")
			},
		async	add(){
				if(this.$u.test.isEmpty(this.info.InvoiceHeader)){
					this.$u.toast("请填写发票抬头");
					return
				}
				if(this.info.NeedVatInvoice==true){
					this.info.NeedVatInvoice=1
				}else{
					this.info.NeedVatInvoice=0
				}
					let openid  = uni.getStorageSync('userinfo');
				const list = await this.$myRequest({url: '/api/Applets/AppletsAddInvoice',
										method:'POST',
										data:{
				  openId: openid.openid,
				  invoice: {
				    id: this.info.ID ,      //添加时这里填0
				    invoiceHeader:this.info.InvoiceHeader ,
				    taxpayerNumber:this.info.TaxpayerNumber,
				    invoiceType:this.show ,
				   companyAddress:this.info.CompanyAddress,
				   NeedVatInvoice:this.info.NeedVatInvoice,
				   companyPhone:this.info.CompanyPhone,
				   openingBranch:this.info.OpeningBranch,
				      bankAccount:this.info.BankAccount,
				  }
				}
										})
											console.log(list)
										if(list.data.Code==200){
											this.$u.toast(list.data.Message);
									
											setTimeout(() => {
												uni.navigateBack({});
											}, 1000);
											console.log(list)
										}
										
			}
		}
		}
	
</script>

<style lang="scss" scoped>
	.u-switch{
	float: right !important; 
	}
	.body{
		height: 100vh;
		background-color: rgb(230, 230, 230);
		.colo{
			margin: 20rpx;
	
			// border: 1rpx solid red;
			position: relative;
			top: 20rpx;
			background-color: #2dbb55
		}
		.concat{
			margin: 20rpx;
			border-radius: 10rpx;
			// height: 200rpx;
			position: relative;
			top: 20rpx;
			background-color: #ffffff;
		
			.lis{
				margin: 10rpx;
				height: 60rpx;
				font-size: 30rpx;
				line-height: 60rpx;
				display: flex;
			
			}
			.bord{
				border-bottom: 1rpx solid rgb(240, 240, 240);
				padding: 10rpx;
			}
			.name{
			
				display: inline-block;
				width: 250rpx;
			}
			.name1{
			
				display: inline-block;
				width: 600rpx;
			}
			.xuan{
			
			
				width: 400rpx;
				text{
					border: 1rpx solid rgb(210, 210, 210);
					border-radius: 30rpx;
					padding: 5rpx 20rpx 5rpx 20rpx;
					margin-left: 20rpx;
				}
				.active{
					background-color: #f0fcf3;
					color: 	#2dbb55;
						border: 1rpx solid #2dbb55;
				}
				.inp{
					line-height: 50rpx;
						width: 450rpx;
						font-size: 25rpx !important;
				}
			}
		}
		.company{
			margin: 20rpx;
			border-radius: 10rpx;
			// height: 200rpx;
			position: relative;
			top: 20rpx;
			background-color: #ffffff;
		}
	}
	
</style>