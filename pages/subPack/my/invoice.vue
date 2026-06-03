<template>
	
	<view class="body">
	<!-- 	<u-empty
		        mode="list"
				:show="show"
		        icon="http://cdn.uviewui.com/uview/empty/car.png"
		>
		</u-empty> -->
	<!-- 	<button class="btn" v-if="show" @click="addContact()">添加增值发票</button> -->
	<!-- 	<view class="">
				<u-button type="primary" v-if="show" style="width: 300rpx;" class="btn" text="确定"></u-button>
		</view> -->
		<view class="u-warp">
			<view class="u-content">
		
				<view class="btn-group">
					<button class="cu-btn bg-white text-green block lg" @click="addContact()">
						<u-icon name="plus" :size="20"></u-icon> <text class="u-m-l-10 u-font-28">添加常用发票</text>
					</button>
				</view>
		
				<view class="address_list" v-for="(item, index) in list" :key="index">
					<view class="addr_info u-flex u-row-between">
						<view class="content" @click="handleRedirect(item)">
							<view class="item">
								<view class="action">
									抬头：
								</view>
								<view class="info">
									{{item.InvoiceHeader}}
								</view>
							</view>
							<view class="item" v-if="item.TaxpayerNumber!==''">
								<view class="action">
									税号：
								</view>
								<view class="info">
									{{item.TaxpayerNumber}}
								</view>
							</view>
							<view class="item">
								<view class="action">
									类型：
								</view>
								<view class="info">
									{{item.InvoiceTypeDesc}}
								</view>
							</view>
						</view>
						<view class="btns u-flex u-m-l-30">
							<view class="addr-btn" @click.stop="addContact(item)">
								<u-icon name="edit-pen" color="#666" size="25"></u-icon>
							</view>
							<view class="addr-btn u-m-l-40" @click.stop="handleDel(item,index)">
								<u-icon name="trash" color="#666" size="25"></u-icon>
							</view>
						</view>
					</view>
				</view>		
			</view>
		
		</view>
	</view>
</template>

<script>
	
	export default {
		data() {
			return {
			show:true,
			FileList:"",
			list:[]
			}
		},
	async 	onLoad() {
			let openid = uni.getStorageSync('userinfo');
			const list = await this.$myRequest({url: '/api/Applets/AppletsGetInvoice',
			data:{
				openId:openid.openid,
				invoiceID: 1
			},
			method:'POST',
					
			})
			if(list.data.Data.length<1){
				this.show=true
			}else{
					this.show=false
					this.list=list.data.Data
			}
			console.log(list.data.Data)
		},
		methods:{
			async 	handleDel(item, index) {
					console.log('handleDel', item.id);
					uni.showModal({
						title: '提示',
						content: '确定要删除该人员信息吗？',
						success:async  (res) => {
							if (res.confirm) {
								let openid  = uni.getStorageSync('userinfo');
										const list = await this.$myRequest({url: '/api/Applets/AppletsDelInvoice',
										method:'POST',
										data:{
											  openId:openid.openid ,
											  invoiceID:item.ID
										},
										})
									this.list.splice(index, 1)
							
							} else if (res.cancel) {
			
							}
						}
					});
				},
			// handleRedirect(item) {
			// 	console.log(333, item);
			// 	uni.$emit('login',{item:item,index:this.key})
			// 		   uni.navigateBack({})
			
			// },
			
			addContact(item) {
				console.log(1111111)
				uni.navigateTo({
					url: `/pages/subPack/my/invoiceAdd?ID=${item?item.ID:0}`
				});
			},
		}
		}
</script>

<style lang="scss" scoped>
.body{
	.btn{
		width: 300rpx !important;
		background-color: #00BBFF;
		color: #ffffff;
		margin-top: 40rpx;
		font-size: 30rpx;
	}
	
	.u-content {
		padding: 30rpx;
	}
	
	.address_list {
		// width: 100%;
		background-color: #FFFFFF;
		padding: 20rpx 30rpx;
		border-radius: 12rpx;
		overflow: hidden;
		margin-top: 30rpx;
	
		.addr_info {
			width: 100%;
	
			.title {
				color: #999999;
				line-height: 50rpx;
			}
	
			.content {
				.item {
					display: flex;
					align-items: center;
					padding: 8rpx 0rpx;
					.action {
						width: 120rpx;
						font-weight: bold;
					}
				}
			}
		}
	}
	
	
}
</style>