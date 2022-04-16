import React from 'react';
import { connect } from 'react-redux';
import { Upload, Input, message, Radio } from 'antd';
import { CameraOutlined, EditFilled } from '@ant-design/icons';
import { validate } from '@/utils';
import './index.less';

const { hidePhoneNum } = validate
const Profile = ( props ) => {
  const { userInfo, radioValue } = props
  return(
    <div className='profile overflow-hidden bg-white'>
      <div className='box-border p_15px font-semibold text-black'>
        <div className='flex'>
          <div className='w_100px h_100px rounded overflow-hidden m_r_20px relative hover'>
            <img alt='' className='absolute w_100px h_100px object-fit-cover rounded' src={userInfo.avatar}/>
            <div className='absolute w_100px h_100px z-20 rounded bg_gray_3 hidden upload'>
              <Upload>
                <div className='w_100px h_100px flex justify-center items-center flex-col font-normal'>
                  <span>更换头像</span>
                  <CameraOutlined/>
                </div>
              </Upload>
            </div>
          </div>
          <div className='item flex items-center border-b w_60'></div>
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px'>手机号码</span>
          <span className='w_300px'>{hidePhoneNum(userInfo.phone_num)}</span>
          <div className='flex items-center cursor-default'>
            <EditFilled/>
            <span className='ml-2 font-normal'>修改</span>
          </div>
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px'>账户密码</span>
          <span className='w_300px'>*****</span>
          <div className='flex items-center cursor-default'>
            <EditFilled/>
            <span className='ml-2 font-normal'>修改</span>
          </div>
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px'>版本类型</span>
          <span className='w_300px'>V1.4</span>
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px '>动画质量</span>
          <div className='w_300px'>
            <Radio.Group value={radioValue}>
              <Radio value={'FLUENCY'}>流畅</Radio>
              <Radio value={'MEDIUM'}>平衡</Radio>
              <Radio value={'HEIGHT'}>高清</Radio>
            </Radio.Group>
          </div>
        </div>
      </div>
    </div>
  )
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
  radioValue: state.quality,
  playState: state.playState,
});
const mapDispatchToProps = (dispatch) => ({})
export default connect(mapStateToProps, mapDispatchToProps)(Profile);


// import React from 'react';
// import { connect } from 'react-redux';
// import { Upload, Input, message, Radio } from 'antd';
// import { CameraTwoTone, EditFilled } from '@ant-design/icons';
// import { validate, type, auth } from '@/utils';
// import API from '@/services';
// import action from '@/actions';
// import './index.less';
// import defaultAvatar from '@/assets/images/model_yoyo.png';
// const ModelTempLate = React.lazy(() => import('@/components/ModelTempLate'));

// const { profile, quality } = action;
// const changePhoneTag = 'check_phone_num';
// const changePasTag = 'reset_password';
// const checkNewPhoneTag = 'reset_phone_num';
// let timer = null;

// class Profile extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       nickName: '', // 昵称
//       nickNamer: '', // 昵称输入框占位符
//       resetName: false, // 重制网名窗口
//       avatar: '', // 头像
//       hidePhoneNum: '', // 处理后的电话号码
//       passWord: {},
//       timeStampPas: '获取验证码',
//       timeStampOldPhone: '获取验证码',
//       timeStampNewPhone: '获取验证码',
//       visible: false, // 弹窗visible
//       modelTitle: '', // 弹窗标题
//       modelVndom: null, //控制弹窗footer和content
//       isGetValidata: false, // 是否已经获取验证码
//       newPhone: '', // 旧手机号码
//       code: {}, // 修改手机号验证码
//     };
//   }

//   // 修改网名窗口
//   handleResetName = (bol) => {
//     this.setState({ resetName: bol });
//   };

//   // 确认修改网名
//   handleComfimrResetName = async () => {
//     if (!this.state.nickNamer) {
//       message.warn('昵称不能为空字符');
//       return false;
//     }
//     let response = null;
//     let data = {
//       avatar: this.state.avatar,
//       nickname: this.state.nickNamer,
//     };
//     try {
//       response = await API.profileApi.updataProfile(data);
//       console.log(response);
//     } catch (error) {
//       return false;
//     }

//     if (response && response.code === 200 && response.data) {
//       auth.setLocal('userInfo', type.toString(response.data));
//       this.setState({ resetName: false });
//       this.props.handleProfile(response.data);
//     }
//   };

//   // 上传先钩子函数
//   handleBeforeUpload = (file) => {
//     const isLt5M = file.size / 1024 / 1024 < 5;
//     if (!isLt5M) {
//       message.error('图片不能超过5mb!');
//     }
//     const isJpgOrPng =
//       file.type === 'image/jpeg' ||
//       file.type === 'image/png' ||
//       file.type === 'image/gif' ||
//       file.type === 'image/webp';

//     if (!isJpgOrPng) {
//       message.error('只能上传JPG/PNG/GIF/WEBP的文件');
//     }
//     return isJpgOrPng && isLt5M;
//   };

//   // Upload 组件方法
//   handleChange = ({ fileList, file }) => {
//     if(file.status === 'done') {
//       this.setState({
//         avatar: file.response?.data,
//       })
//       this.updataUserInfo()
//     }
//   };


//   updataUserInfo = async () => {
//     let res = null
//     let data = {
//       avatar: this.state.avatar,
//       nickname: this.state.nickNamer || this.state.nickName
//     }
//     try {
//       res = await API.profileApi.updataProfile(data)
//     } catch (error) {
//       message.error(error || '修改失败！')
//     }
//     if(res && res.code === 200) {
//       let user_info = res.data
//       user_info.token = auth.getLocal('token')
//       this.props.handleProfile(user_info);
//       auth.setLocal('userInfo', type.toString(user_info))
//       message.success('修改成功')
//       this.setState({
//         resetName: false,
//         nickName: user_info.nickname
//       })
//     }

//   }

//   // Radio事件
//   handleRadioChange = (e) => {
//     console.log(e.target.value);
//   };

//   // 退出
//   handleLogOut = () => {
//     if (this.props.playState) {
//       message.warning('正在播放，无法退出！');
//       return false;
//     }
//     localStorage.clear();
//     window.location.reload();
//   };

//   // 上传图片参数
//   data = (file) => {
//     const suffix = file.name.slice(file.name.lastIndexOf('.'));
//     return {
//       suffix: suffix,
//       preffix: 'feedbackImg',
//     };
//   };

//   // 修改密码弹窗footer
//   changePasFooter = () => (
//     <div>
//       <button
//         className='border font_12 py-1 w_65px mr_8px rounded-full'
//         onClick={this.handleCancel}
//       >
//         取 消
//       </button>
//       <button
//         className='border font_12 py-1 w_65px rounded-full bg-FF8462 text-white'
//         onClick={this.handleComfirmChangePas}
//       >
//         确 认
//       </button>
//     </div>
//   );

//   // 修改密码弹窗中心内容
//   changePasContent = () => (
//     <div>
//       <p className='origin_pasword flex items-center border-b relative'>
//         <Input
//           style={{
//             height: '32px',
//             border: 'none',
//             padding: '4px 10px',
//             color: '#000',
//           }}
//           disabled
//           value={this.state.hidePhoneNum}
//         />
//         <button
//           className='absolute right-3 px-2 py-1 border rounded-full'
//           onClick={() =>
//             this.getValidateCode(changePasTag, this.props.userInfo.phone_num)
//           }
//         >
//           {validate.isNumber(this.state.timeStampPas) ? (
//             <>
//               {this.state.timeStampPas}
//               秒后重发
//             </>
//           ) : (
//             <>{this.state.timeStampPas}</>
//           )}
//         </button>
//       </p>
//       <p className='new_pasword flex items-center'>
//         <label className='flex-none mr-2 ml_10px'>输入验证码：</label>
//         <Input
//           autoComplete='new-password'
//           onChange={(e) => {
//             this.state.passWord.code = e.target.value;
//             this.setState({
//               passWord: this.state.passWord,
//             });
//           }}
//           style={{
//             height: '28px',
//             border: 'none',
//             borderBottom: '1px solid #ccc',
//           }}
//           placeholder='请输入新密码'
//           value={this.state.passWord.code}
//         />
//       </p>
//       <p className='new_pasword flex items-center'>
//         <label className='flex-none mr-2 ml_10px'>输入新密码：</label>
//         <Input.Password
//           autoComplete='new-password'
//           onChange={(e) => {
//             this.state.passWord.newPas = e.target.value;
//             this.setState({
//               passWord: this.state.passWord,
//             });
//           }}
//           style={{
//             height: '28px',
//             border: 'none',
//             borderBottom: '1px solid #ccc',
//           }}
//           placeholder='请输入新密码'
//           value={this.state.passWord.newPas}
//         />
//       </p>
//       <p className='comfire_pasword flex items-center' style={{ margin: 0 }}>
//         <label className='flex-none mr-2 ml_10px'>确认新密码：</label>
//         <Input.Password
//           autoComplete='new-password'
//           onChange={(e) => {
//             this.state.passWord.comfirmPas = e.target.value;
//             this.setState({
//               passWord: this.state.passWord,
//             });
//           }}
//           style={{
//             height: '28px',
//             border: 'none',
//             borderBottom: '1px solid #ccc',
//           }}
//           placeholder='请确认新密码'
//           value={this.state.passWord.comfirmPas}
//         />
//       </p>
//     </div>
//   );

//   // 修改手机号码弹窗footer
//   changePhoneFooter = () => (
//     <div className='flex justify-center font_12'>
//       <button
//         className='border rounded-full px-4 w_65px mr-3'
//         onClick={this.handleCancel}
//       >
//         取消
//       </button>
//       <button
//         className='border rounded-full py-1 w_65px bg-FF8462 font_12 text-white'
//         onClick={this.handleNext}
//       >
//         下一步
//       </button>
//     </div>
//   );

//   // 修改手机号码弹窗中心内容
//   changePhoneContent = () => (
//     <div>
//       <p className='origin_pasword flex items-center border rounded relative'>
//         <Input
//           style={{
//             height: '32px',
//             border: 'none',
//             padding: '4px 10px',
//             color: '#000',
//           }}
//           disabled
//           value={this.state.hidePhoneNum}
//           maxLength={11}
//         />
//         <button
//           className='absolute right-0 px-2 py-1 border-l h-full'
//           onClick={() => {
//             this.getValidateCode(changePhoneTag, this.props.userInfo.phone_num);
//           }}
//         >
//           {validate.isNumber(this.state.timeStampOldPhone) ? (
//             <>
//               {this.state.timeStampOldPhone}
//               秒后重发
//             </>
//           ) : (
//             <>{this.state.timeStampOldPhone}</>
//           )}
//         </button>
//       </p>
//       <p className='flex items-center border-b'>
//         <Input
//           autoComplete='off'
//           bordered={false}
//           placeholder='请输入验证码'
//           maxLength={11}
//           value={this.state.code.oldPhoneCode}
//           onChange={(e) => {
//             this.state.code.oldPhoneCode = e.target.value;
//             this.setState({ code: this.state.code });
//           }}
//         />
//       </p>
//     </div>
//   );

//   // 确认修改手机号弹窗footer
//   comfirmPhoneFooter = () => (
//     <div className='flex justify-center font_12'>
//       <button
//         className='border rounded-full px-4 py-1 mr-3'
//         onClick={this.handleCancel}
//       >
//         取消
//       </button>
//       <button
//         className='border rounded-full px-4 py-1 bg-FF8462 text-white'
//         onClick={this.handleComfirm}
//       >
//         确定
//       </button>
//     </div>
//   );

//   // 确认修改手机号弹窗中心内容
//   comfirmPhoneContent = () => (
//     <div>
//       <p className='origin_pasword flex items-center border rounded relative'>
//         <Input
//           style={{
//             height: '32px',
//             border: 'none',
//             padding: '4px 10px',
//             color: '#000',
//           }}
//           value={this.state.newPhone}
//           onChange={(e) => {
//             this.setState({ newPhone: e.target.value });
//           }}
//           maxLength={11}
//         />
//         <button
//           className='absolute right-0 px-2 py-1 border-l h-full'
//           onClick={() => {
//             this.getValidateCode(checkNewPhoneTag, this.state.newPhone);
//           }}
//         >
//           {validate.isNumber(this.state.timeStampNewPhone) ? (
//             <>
//               {this.state.timeStampNewPhone}
//               秒后重发
//             </>
//           ) : (
//             <>{this.state.timeStampNewPhone}</>
//           )}
//         </button>
//       </p>
//       <p className='flex items-center border-b'>
//         <Input
//           autoComplete='off'
//           bordered={false}
//           placeholder='请输入验证码'
//           maxLength={11}
//           value={this.state.code.newPhoneCode}
//           onChange={(e) => {
//             this.state.code.newPhoneCode = e.target.value;
//             this.setState({ code: this.state.code });
//           }}
//         />
//       </p>
//     </div>
//   );

//   // 下一步
//   handleNext = async () => {
//     const {
//       isGetValidata,
//       hidePhoneNum,
//       code: { oldPhoneCode },
//     } = this.state;
//     const {
//       userInfo: { phone_num },
//     } = this.props;
//     if (!isGetValidata) {
//       message.warning('请先获取验证码!');
//       return false;
//     }
//     if (!hidePhoneNum) {
//       message.warning('手机号码不能为空！');
//       return false;
//     }
//     if (!validate.validPhone(phone_num)) {
//       message.warning('手机号码格式不对！');
//       return false;
//     }
//     if (!oldPhoneCode) {
//       message.warning('请输入验证码!');
//       return false;
//     }
//     if (!validate.isChinese(oldPhoneCode)) {
//       message.warning('请输入正确的验证码!');
//       return false;
//     }

//     let res = null;
//     try {
//       res = await API.profileApi.checkOldPhone({
//         phone_num: phone_num,
//         code: oldPhoneCode,
//         sms_use: changePhoneTag,
//       });
//     } catch (error) {
//       message.error('修改失败！');
//       return false;
//     }

//     if (res && res.code === 200) {
//       this.setState({
//         modelVndom: 1,
//         isGetValidata: false,
//       });
//       clearTimeout(timer);
//     }
//   };

//   // 确认修改密码
//   handleComfirmChangePas = async () => {
//     console.log(this.state.passWord);
//     const { comfirmPas, newPas, code } = this.state.passWord;

//     // 校验
//     if (!code || !newPas || !comfirmPas) {
//       message.warning('信息内容不能为空!');
//       return false;
//     }

//     // 检验密码是否相同
//     if (newPas != comfirmPas) {
//       message.warning('密码不一致!');
//       return false;
//     }

//     // 检验不能有中文字符
//     if (
//       !validate.isChinese(code) ||
//       !validate.isChinese(comfirmPas) ||
//       !validate.isChinese(newPas)
//     ) {
//       message.error('内容不能含有中文字符！');
//       return false;
//     }

//     const data = {
//       phone_num: this.props.userInfo.phone_num,
//       new_password: newPas,
//       code,
//       sms_use: changePasTag,
//     };

//     let res = null;
//     try {
//       res = await API.profileApi.resetPassword(data);
//     } catch (error) {
//       message.error(error || '密码修改失败！');
//       return false;
//     }

//     if (res && res.code === 200) {
//       message.success('修改成功，即将退出重新登录！');
//       this.setState({
//         visible: false,
//         title: '',
//         timeStamp: '获取验证码',
//       });
//       clearTimeout(timer);
//       let timeOut = setTimeout(() => {
//         localStorage.clear();
//         window.location.reload();
//         clearTimeout(timeOut);
//       }, 1500)
//     }
//   };

//   // 新手机号修改确认
//   handleComfirm = async () => {
//     const { newPhone, isGetValidata, code } = this.state;
//     if (!newPhone) {
//       message.warning('手机号码不能为空！');
//       return false;
//     }
//     if (!validate.validPhone(newPhone)) {
//       message.warning('手机格式不对！');
//       return false;
//     }
//     if (!isGetValidata) {
//       message.warning('请先获取验证码！');
//       return false;
//     }
//     if (!code.newPhoneCode) {
//       message.warning('验证码不能为空！');
//       return false;
//     }

//     let res = null;
//     try {
//       res = await API.profileApi.changePhone({
//         phone_num: this.props.userInfo.phone_num,
//         new_phone_num: this.state.newPhone,
//         code: this.state.code.newPhoneCode,
//         sms_use: checkNewPhoneTag,
//       });
//     } catch (error) {
//       message.error(error || '修改失败！');
//       return false;
//     }

//     if (res && res.code === 200) {
//       message.success('修改成功，即将退出重新登录！');
//       this.setState({
//         newPhone: '',
//         code: {},
//         isGetValidata: false,
//         passWord: {},
//         visible: false,
//         timeStampNewPhone: '获取验证码',
//         timeStampOldPhone: '获取验证码',
//       });
//       let timeOut = setTimeout(() => {
//         localStorage.clear();
//         window.location.reload();
//         clearTimeout(timeOut);
//       }, 1500)
//     }
//   };

//   // 取消
//   handleCancel = () => {
//     this.setState({
//       visible: false,
//       isGetValidata: false,
//       passWord: {},
//       code: {},
//       timeStampPas: '获取验证码',
//       timeStampOldPhone: '获取验证码',
//       timeStampNewPhone: '获取验证码',
//     });
//     clearTimeout(timer);
//     timer = null;
//   };

//   // 修改手机号
//   handleChangePhone = () => {
//     if(this.props.playState) {
//       message.warning('正在播放，无法修改手机号码！')
//       return false
//     }
//     this.setState({
//       visible: true,
//       modelVndom: 2,
//       modelTitle: '修改手机号',
//     });
//   };

//   // 修改密码
//   handleChangePas = () => {
//     if(this.props.playState) {
//       message.warning('正在播放，无法修改密码！')
//       return false
//     }
//     this.setState({
//       visible: true,
//       modelVndom: 3,
//       modelTitle: '修改密码',
//     });
//   }

//   // 修改手机号码获取验证码
//   getValidateCode = async (tag, phone) => {
//     this.countDown(60000);
//     if (!phone) {
//       message.warning('请输入手机号码！');
//       return false;
//     }
//     if (!validate.validPhone(phone)) {
//       message.error('手机号码格式不正确！');
//       return false;
//     }

//     let res;
//     try {
//       res = await API.loginApi.getValidCode({
//         phone_num: phone,
//         sms_use: tag,
//       });
//     } catch (error) {
//       message.error(error || '获取验证码失败！');
//       clearTimeout(timer);
//       this.setState({
//         timeStamp: '获取验证码',
//       });
//       return false;
//     }
//     this.countDown(60000);
//     if (
//       res &&
//       res.code === 200 &&
//       (tag === changePhoneTag || tag === checkNewPhoneTag)
//     ) {
//       this.setState({ isGetValidata: true });
//     }
//   };

//   // 倒数计时
//   countDown = (ms) => {
//     let maxTime = ms / 1000;
//     let that = this;
//     const { modelVndom } = this.state;
//     clearTimeout(timer);
//     timer = setTimeout(function f() {
//       if (maxTime > 1) {
//         --maxTime;
//         if (modelVndom === 1) {
//           that.setState({ timeStampNewPhone: maxTime });
//         }
//         if (modelVndom === 2) {
//           that.setState({ timeStampOldPhone: maxTime });
//         }
//         if (modelVndom === 3) {
//           that.setState({ timeStampPas: maxTime });
//         }
//       } else {
//         if (modelVndom === 1) {
//           that.setState({
//             timeStampNewPhone: '重新发送',
//           });
//         }
//         if (modelVndom === 2) {
//           that.setState({
//             timeStampOldPhone: '重新发送',
//           });
//         }
//         if (modelVndom === 3) {
//           that.setState({
//             timeStampPas: '重新发送',
//           });
//         }
//         clearTimeout(timer);
//         return;
//       }
//       setTimeout(f, 1000);
//     }, 1000);
//   };

//   componentDidMount() {
//     this.setState({
//       avatar: this.props.userInfo.avatar,
//       nickName: this.props.userInfo.nickname,
//       hidePhoneNum: validate.hidePhoneNum(
//         type.toString(this.props.userInfo.phone_num)
//       ),
//     });
//   }

//   render() {
//     const {
//       avatar,
//       nickName,
//       resetName,
//       hidePhoneNum,
//       visible,
//       modelTitle,
//       modelVndom,
//     } = this.state;
//     const { radioValue, handleRadioChange } = this.props;
//     return (
//       <div className='profile overflow-hidden box-border'>
//         <div className='bg-white rounder relative profile_h_full'>
//           <div className='base_info'>
//             <div className='flex mt-8'>
//               <div className='ml-8 image_box h_w_100 rounded overflow-hidden flex-none'>
//                 {
//                   <Upload
//                     beforeUpload={this.handleBeforeUpload}
//                     onChange={this.handleChange}
//                     data={(file) => this.data(file)}
//                     action={`${process.env.REACT_APP_API}/api/common/upload`}
//                     accept='.jpg, .png, .gif, .webp'
//                   >
//                     {avatar ? (
//                       <div className='relative avatar h-full'>
//                         <img className='h-full' src={avatar} alt='' />
//                         <div className='absolute top-0 left-0 z-10 h_w_100 rounded text-center hidden flex-col justify-center avatar_model'>
//                           <CameraTwoTone twoToneColor='#fff' />
//                           <p
//                             style={{ marginTop: '10px' }}
//                             className='font_12 text-white'
//                           >
//                             修改我的头像
//                           </p>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className='h_w_100 border-0 overflow-hidden relative avatar'>
//                         <img
//                           className='w-full border-0 '
//                           src={defaultAvatar}
//                           alt=''
//                         />
//                         <div className='absolute top-0 left-0 z-10 h_w_100 rounded text-center hidden flex-col justify-center avatar_model'>
//                           <CameraTwoTone twoToneColor='#fff' />
//                           <p
//                             style={{ marginTop: '10px' }}
//                             className='font_12 text-white'
//                           >
//                             上传头像
//                           </p>
//                         </div>
//                       </div>
//                     )}
//                   </Upload>
//                 }
//               </div>
//               <div className='ml-8 w__60 box-border pr-8'>
//                 <div className='p_t_b_30 form border-b'>
//                   {!resetName ? (
//                     <div className='font_26  font-semibold flex items-center'>
//                       <span className='mr-4 text-black'>
//                         {nickName ? nickName : 'YoYo'}
//                       </span>
//                       <div
//                         className='cursor-pointer text-black'
//                         onClick={() => this.handleResetName(true)}
//                       >
//                         <EditFilled />
//                       </div>
//                     </div>
//                   ) : (
//                     <div className='flex items-start'>
//                       <label className='font_15 w_120 color-444 font-semibold mr-4 flex-none'>
//                         用户名
//                       </label>
//                       <div>
//                         <Input
//                           style={{ width: '420px', border: '1px solid #ccc' }}
//                           value={this.state.nickNamer}
//                           onChange={(e) => {
//                             this.setState({ nickNamer: e.target.value });
//                           }}
//                         />
//                         <p className='mt-6'>
//                           <button
//                             className='btn-confime px-4 py-1 text-center rounded bg-001529 color-666'
//                             onClick={()=>this.updataUserInfo()}
//                           >
//                             确认
//                           </button>
//                           <button
//                             className='btn-cancel  px-4 py-1 rounded border ml-4'
//                             onClick={() => this.handleResetName(false)}
//                           >
//                             取消
//                           </button>
//                         </p>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 <div className='p_t_b_30 form border-b flex'>
//                   <div className='font_15 color-444 font-semibold flex items-center  w-4/6'>
//                     <span className='mr-4 w_120'>手机号码</span>
//                     <div className='cursor-pointer'>{hidePhoneNum}</div>
//                   </div>
//                   <div
//                     className='flex items-center text-black cursor-default'
//                     onClick={this.handleChangePhone}
//                   >
//                     <EditFilled />
//                     <span className='ml-2'>修改</span>
//                   </div>
//                 </div>

//                 <div className='p_t_b_30 form border-b flex'>
//                   <div className='font_15 color-444 font-semibold flex items-center w-4/6'>
//                     <span className='mr-4 w_120'>账户密码</span>
//                     <div className='cursor-pointer'>******</div>
//                   </div>
//                   <div
//                     className='flex items-center text-black cursor-default'
//                     onClick={this.handleChangePas}
//                   >
//                     <EditFilled />
//                     <span className='ml-2'>修改</span>
//                   </div>
//                 </div>

//                 <div className='p_t_b_30 form border-b'>
//                   <div className='font_15 color-444 font-semibold flex items-center'>
//                     <span className='mr-4 w_120'>版本类型</span>
//                     <div className='cursor-pointer'>v1.4</div>
//                   </div>
//                 </div>

//                 <div className='p_t_b_30 form border-b'>
//                   <div className='font_15 color-444 font-semibold flex items-center'>
//                     <span className='mr-4 w_120'>动画质量</span>
//                     <div className='cursor-pointer flex'>
//                       <Radio.Group
//                         onChange={(e) => handleRadioChange(e.target.value)}
//                         value={radioValue}
//                       >
//                         <Radio value={'FLUENCY'}>流畅</Radio>
//                         <Radio value={'MEDIUM'}>平衡</Radio>
//                         <Radio value={'HEIGHT'}>高清</Radio>
//                       </Radio.Group>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <div className='w-full text-center'>
//             <div
//               className='rounded-full py-2 bg-FF8462 w_150px m-auto mt-10 text-white'
//               onClick={this.handleLogOut}
//             >
//               退 出
//             </div>
//           </div>
//         </div>
//         <ModelTempLate
//           visible={visible}
//           title={modelTitle}
//           footer={
//             modelVndom == 3
//               ? this.changePasFooter()
//               : modelVndom == 2
//                 ? this.changePhoneFooter()
//                 : modelVndom == 1 && this.comfirmPhoneFooter()
//           }
//           content={
//             modelVndom == 3
//               ? this.changePasContent()
//               : modelVndom == 2
//                 ? this.changePhoneContent()
//                 : modelVndom == 1 && this.comfirmPhoneContent()
//           }
//         ></ModelTempLate>
//       </div>
//     );
//   }
// }

// const mapDispatchToProps = (dispatch) => ({
//   handleProfile: (data) => {
//     dispatch(profile.addProfile(data));
//   },
//   handleRadioChange: (value) => {
//     dispatch(quality.handleChange(value));
//   },
// });

// const mapStateToProps = (state) => ({
//   userInfo: state.userInfo,
//   radioValue: state.quality,
//   playState: state.playState,
// });

// export default connect(mapStateToProps, mapDispatchToProps)(Profile);
