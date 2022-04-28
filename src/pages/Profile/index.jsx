import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Upload, Input, message, Radio } from 'antd';
import { CameraOutlined, EditFilled } from '@ant-design/icons';
import { LoginActions, PlayAutoActions, ProfileActions } from '@/store/actions'
import { validate, type } from '@/utils';
import API from '@/services';
import './index.less';


let timer;
const resetPasswordTag = 'reset_password';
const checkPhoneNumTag = 'check_phone_num';
const resetPhoneNumTag = 'reset_phone_num';
const { hidePhoneNum } = validate
const { toObject, toString } = type
const Modal = React.lazy(() => import('@/components/Modal'))

const Profile = ( props ) => {
  const { userInfo, resolute, playState, handleUpdateUserInfo } = props;
  // 默认昵称
  const [defNickName] = useState('YoYo');
  // 昵称输入框占位符
  const [nickName, setNickName] = useState();
  // 重制昵称窗口
  const [isResetNickName, setIsResetNickName] = useState(false);
  // modal标题
  const [modalTitle, setModalTitle] = useState();
  // modal visible
  const [modalVisible, setModalVisible] = useState(false);
  // modal bodyStyle
  const [bodyStyle] = useState({padding: '10px 15px', height: 'auto'});
  // 修改密码验证码
  const [pasCode, setPasCode] = useState();
  // 新密码
  const [newPassWord, setPassWord] = useState();
  // 确认新密码
  const [comfirPassWord, setComfirPassWord] = useState();
  // 倒计时
  const [time, setTime] = useState(0);
  // 登陆页首次获取验证码
  const [initTime, setIntTime] = useState(false);
  // 是否已经获取过验证码
  const [isGetCode, setIsGetCode] = useState(false);
  // 旧手机号验证码
  const [oldPhoneCode, setOldPhoneCode] = useState();
  // 新手机号验证码
  const [newPhoneCode, setNewPhoneCode] = useState();
  // 新手机号
  const [newPhoneNumber, setNewPhoneNumber] = useState();
  // 弹窗VNdom
  const [VNdom, setVNdom] = useState(0);
  // 是否提交过
  const [isSubmit, setIsSubmit] = useState(false);

  // hook 根据依赖自动计算倒计时
  useEffect(() => {
    timer = setTimeout(() => {
      if (time > 0) {
        clearTimeout(timer)
        setTime((t) => t - 1);
      }
    }, 1000);
    return function () {
      clearInterval(timer)
    }
  }, [time]);

  // 修改密码VNdom
  const changePasVNdom = () =>(
    <>
      <div className='item flex justify-between items-center relative border-b px-2 py-1 mb-3'>
        <span>{hidePhoneNum(userInfo.phone_num)}</span>
        <div className='right-0 py-1 px-3 font_12 border rounded-full flex-none'>
          {
            time?(
              <span>{time}秒后重发</span>
            ):(
              <button onClick={handleCode.bind(this, VNdom)}>
                {
                  initTime?(<>重新发送</>):(<>获取验证码</>)
                }
              </button>
            )
          }
        </div>
      </div>
      <div className='item flex items-center font_12 mb-3'>
        <span className='flex-none mr-2 pl-2'>输入验证码：</span>
        <div className='border-b flex-1'>
          <Input
            value={pasCode}
            bordered={false}
            autoComplete='new-password'
            placeholder='请输入新密码'
            onChange={e=>setPasCode(e.target.value)}
          />
        </div>
      </div>
      <div className='item flex items-center font_12 mb-3'>
        <span className='flex-none mr-2 pl-2'>输入新密码：</span>
        <div className='border-b flex-1'>
          <Input.Password
            value={newPassWord}
            minLength={6}
            maxLength={20}
            bordered={false}
            autoComplete='new-password'
            placeholder='请输入新密码'
            onChange={e=>setPassWord(e.target.value)}
          />
        </div>
      </div>
      <div className='item flex items-center font_12 mb-3'>
        <span className='flex-none mr-2 pl-2'>确认新密码：</span>
        <div className='border-b flex-1'>
          <Input.Password
            value={comfirPassWord}
            minLength={6}
            maxLength={20}
            bordered={false}
            autoComplete='new-password'
            placeholder='请输入新密码'
            onChange={e=>setComfirPassWord(e.target.value)}
          />
        </div>
      </div>
    </>
  );

  // 修改手机号第一步VNdom
  const oldPhoneVNdom = () => (
    <>
      <div className='item flex h_32px mb-4'>
        <span className='border flex-1 py-1 px-1'>{hidePhoneNum(userInfo.phone_num)}</span>
        <div className='flex items-center justify-center flex-none border-t border-r border-b px-2 font_12'>
          {
            time?(
              <span>{time}秒后重发</span>
            ):(
              <button onClick={handleCode.bind(this, VNdom)}>
                {
                  initTime?(<>重新发送</>):(<>获取验证码</>)
                }
              </button>
            )
          }
        </div>
      </div>
      <div className='item flex h_32px mb-4 border-b'>
        <Input
          value={oldPhoneCode}
          bordered={false}
          autoComplete='new-password'
          placeholder='请输入验证码'
          onChange={e=>setOldPhoneCode(e.target.value)}
        />
      </div>
    </>
  );

  // 修改手机号第二步VNdom
  const newPhoneVNdom = () => (
    <>
      <div className='item flex h_32px mb-4'>
        <div className='border flex-1 py-1 px-1'>
          <Input
            value={newPhoneNumber}
            bordered={false}
            autoComplete='new-password'
            placeholder='请输入新手机号码'
            onChange={e=>setNewPhoneNumber(e.target.value)}
          />
        </div>
        <button className='flex-none border-t border-r border-b px-2 font_12'>获取验证码</button>
      </div>
      <div className='item flex h_32px mb-4 border-b'>
        <Input
          value={newPhoneCode}
          bordered={false}
          autoComplete='new-password'
          placeholder='请输入验证码'
          onChange={e=>setNewPhoneCode(e.target.value)}
        />
      </div>
    </>
  );

  // 获取验证码
  const handleCode = (vndom) => {
    let phoneNum = (vndom === 1 || vndom === 3)? userInfo.phone_num : newPhoneNumber

    if( !phoneNum ) {
      message.error('手机号不能为空！', 0.5)
      return false
    }

    // 提交还没有回应禁止第二次提交，避免重复请求
    if( isSubmit ){ return false }
    setIsSubmit(true)

    // 倒计时开始
    setTime(60)
    // 首次获取验证码
    setIntTime(true)
    // 已经获取验证码
    setIsGetCode(true)

    let tag = (vndom === 3) && resetPasswordTag
    tag = (vndom === 1) && checkPhoneNumTag
    tag = (vndom === 2) && resetPhoneNumTag
    getValidateCode(phoneNum, tag)
  };

  // 获取验证码请求
  const getValidateCode = (phone, tag) => {
    const data = {
      phone_num: phone,
      sms_use: tag
    }
    API.loginApi.getValidCode(data)
      .then(r => {
        setIsSubmit(false)
        setIsGetCode(false)
        message.error(r || '获取验证码失败！', 0.5);
      }).catch(e => {
        setIsSubmit(false)
        setIsGetCode(false)
        message.error(e || '获取验证码失败！', 0.5);
        return false
      })
  };

  // 弹出弹窗
  const handleOpenModal = (txt, VNdom) => {
    if( playState ) {
      message.warning('播放中，无法进行修改手机哈或密码操作！', 0.5)
      return false
    }
    setModalTitle(txt)
    setVNdom(VNdom)
    setModalVisible(true)
  };

  // 关闭弹窗
  const handleCloseModal = () => {
    clearTimeout(timer)
    setModalVisible(false)
    setIntTime(false)
    setIsSubmit(false)
    setIsGetCode(false)
    setTime(0)
    setPasCode('')
    setPassWord('')
    setComfirPassWord('')
  };

  // 弹窗onOk
  const handleSubmit = (VNdom) => {
    switch ( VNdom ){
      case 3:
        changePassword()
        break;
      case 2:
        changePhoneNext()
        break;
      case 1:
        changePhonePre()
        break;
      default:
        return
    }
  };

  // 修改密码
  const changePassword = () => {
    if( !isGetCode ){
      message.error('请先获取验证码！', 0.5)
      return false
    }
    if( !pasCode || !newPassWord || !comfirPassWord) {
      message.error('请输入完整信息！', 0.5)
      return false
    }
    if( newPassWord !== comfirPassWord ) {
      message.error('密码不一致！', 0.5)
      return false
    }
    const data = {
      phone_num: this.props.userInfo.phone_num,
      new_password: newPassWord,
      code: pasCode,
      sms_use: resetPasswordTag,
    }
    API.profileApi.resetPassword(data)
      .then(r => {
        message.success('修改成功，即将退出重新登录！', 0.5);
        handleCloseModal()
        const timeOut = setTimeout(()=>{
          window.location.reload();
          localStorage.clear();
          clearTimeout(timeOut);
        }, 1000)
      }).catch(e => {
        message.error(e || '修改密码失败!', 0.5)
        return false
      })
  };

  // 修改手机号第一步
  const changePhonePre = () => {
    if( !isGetCode ){
      message.error('请先获取验证码！', 0.5)
      return false
    }
    if( !oldPhoneCode ) {
      message.error('验证码不能为空！', 0.5)
      return false
    }

    const data ={
      phone_num: userInfo.phone_num,
      code: oldPhoneCode,
      sms_use: checkPhoneNumTag,
    }
    API.profileApi.checkOldPhone(data)
      .then(r => {
        setIntTime(false)
        setTime(0)
        setVNdom(2)
        setOldPhoneCode()
      }).catch(e => {
        message.error(e || '错误，无法进行下一步！', 0.5)
        return false
      })
  }

  // 修改手机号第二步
  const changePhoneNext = () => {
    if( !newPhoneNumber ) {
      message.warning('请输入要更换的要手机号码！', 0.5)
      return false
    }
    if( !isGetCode ){
      message.error('请先获取验证码！', 0.5)
      return false
    }

    const data = {
      phone_num: userInfo.phone_num,
      new_phone_num: newPhoneNumber,
      code: newPhoneCode,
      sms_use: resetPhoneNumTag
    }
    API.profileApi.changePhone(data)
      .then(r => {
        message.success('修改成功，即将退出重新登录！', 0.5)
        handleCloseModal()
        const timeOut = setTimeout(()=>{
          window.location.reload();
          localStorage.clear();
          clearTimeout(timeOut);
        }, 1000)
      }).catch(e => {
        message.error(e || '修改失败！');
        return false
      })
  };

  // 更新头像
  const handleUpdateAvatar = ({ file }) => {
    if( file.status === 'done' ) {
      const data ={
        avatar: file.response.data,
        nickname: userInfo.nickname || defNickName
      }
      updateUserInfo(data)
    }
  }

  // 更新昵称
  const handleUpdateNickname = () => {
    if( !nickName ) {
      message.warning('内容不能为空！', 0.5)
      return false
    }
    const data = {
      avatar: userInfo.avatar,
      nickname: nickName
    }
    updateUserInfo(data)
  }

  // 更新个人信息请求
  const updateUserInfo = (data) => {
    API.profileApi.updataProfile(data)
      .then(r => {
        handleUpdateUserInfo(r.data)
        setIsResetNickName(false)
        // 重制本地缓存
        const userInfo = toObject(localStorage.getItem('userInfo'))
        Object.assign(userInfo, r.data)
        localStorage.setItem('userInfo', toString(userInfo))
      }).catch(e => {
        message.error(e || '修改失败！', 0.5)
        return false
      })
  }

  // 退出
  const handleLoginOut = () => {
    if( playState ) {
      message.warning('正在播放，无法退出！')
      return false
    }
    props.handleLoginOut()
  }

  return(
    <div className='profile overflow-hidden bg-white'>
      <div className='box-border p_15px font-semibold text-black'>
        <div className='flex'>
          <div className='w_100px h_100px rounded overflow-hidden m_r_20px relative hover'>
            <img alt='' className='absolute w_100px h_100px object-fit-cover rounded' src={userInfo.avatar || 'https://joeschmoe.io/api/v1/random'}/>
            <div className='absolute w_100px h_100px z-20 rounded bg_gray_3 hidden upload'>
              <Upload
                data={file=>({
                  suffix: file.name.slice(file.name.lastIndexOf('.')),
                  preffix: 'feedbackImg',
                })}
                onChange={handleUpdateAvatar}
                accept='.jpg, .png, .gif, .webp'
                action={`${process.env.REACT_APP_API}/api/common/upload`}
              >
                <div className='w_100px h_100px flex justify-center items-center flex-col font-normal'>
                  <span>更换头像</span>
                  <CameraOutlined/>
                </div>
              </Upload>
            </div>
          </div>
          { !isResetNickName?
            (<div className='item flex items-center border-b w_60 font_26'>
              <span >{userInfo.nickname || defNickName}</span>
              <div
                className='flex items-center justify-center ml-2'
                onClick={()=>setIsResetNickName(true)}
              >
                <EditFilled/>
              </div>
            </div>):
            (<div className='item flex items-center w_60 border-b'>
              <div className='w_60'>
                <div className='border'>
                  <Input
                    value={nickName}
                    bordered={false}
                    autoComplete='new-password'
                    placeholder='请输入内容'
                    onChange={e=>setNickName(e.target.value)}
                  />
                </div>
                <div className='flex font_12 mt-4'>
                  <button className='border rounded px-4 py-1 mr-4' onClick={()=>setIsResetNickName(false)}>取消</button>
                  <button className='border rounded px-4 py-1 bg-FF8462 text-white' onClick={handleUpdateNickname}>确定</button>
                </div>
              </div>
            </div>)
          }
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px'>手机号码</span>
          <span className='w_300px'>{hidePhoneNum(userInfo.phone_num)}</span>
          <div className='flex items-center cursor-default' onClick={handleOpenModal.bind(this, '修改手机号', 1)}>
            <EditFilled/>
            <span className='ml-2 font-normal'>修改</span>
          </div>
        </div>
        <div className='item m_l_120px p_y_25px w_60 border-b flex'>
          <span className='w_100px'>账户密码</span>
          <span className='w_300px'>*****</span>
          <div className='flex items-center cursor-default' onClick={handleOpenModal.bind(this, '修改密码', 3)}>
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
            <Radio.Group
              value={resolute}
              onChange={e=>props.handleResolute(e.target.value)}
            >
              <Radio value={'FLUENCY'}>流畅</Radio>
              <Radio value={'MEDIUM'}>平衡</Radio>
              <Radio value={'HEIGHT'}>高清</Radio>
            </Radio.Group>
          </div>
        </div>
        <div className='item m_l_120px p_y_25px w_60 flex items-center justify-center' onClick={handleLoginOut}>
          <button className='py-2 px-16 rounded-full border bg-FF8462 text-white'>退 出</button>
        </div>
      </div>
      <Modal
        visible={modalVisible}
        bodyStyle={bodyStyle}
        title={modalTitle}
        onCancel={handleCloseModal}
        onOk={handleSubmit.bind(this, VNdom)}
      >
        {
          (VNdom === 1) && oldPhoneVNdom()
        }
        {
          (VNdom === 2) && newPhoneVNdom()
        }
        {
          (VNdom === 3) && changePasVNdom()
        }
      </Modal>
    </div>
  );
}

const mapStateToProps = (state) => ({
  userInfo: state.userInfo,
  resolute: state.resolute,
  playState: state.playState,
});
const mapDispatchToProps = (dispatch) => ({
  /**
   * 更新个人信息
   */
  handleUpdateUserInfo: (data) => {
    dispatch({
      type: LoginActions.UpdateUserInfo,
      data
    })
  },

  /**
   * 更新清晰度
   */
  handleResolute: (data) => {
    dispatch({
      type: ProfileActions.UpdateResolute,
      data
    })
  },

  /**
   * 退出
   */
  handleLoginOut: () => {
    localStorage.clear()
    /**
     * 清除选中的播放
     */
    dispatch({
      type: PlayAutoActions.ClearPlayItem,
    })
    /**
     * 清除播放商品列表
     */
    dispatch({
      type: PlayAutoActions.ClearGoodsList
    })
    /**
     * 清空播放列表
     */
    dispatch({
      type: PlayAutoActions.ClearPlayList
    })
    /**
     * 清除竖向背景图列表
     */
    dispatch({
      type: PlayAutoActions.ClearBackGroungVertical
    })
    /**
     * 清除横背景图列表
     */
    dispatch({
      type: PlayAutoActions.ClearBackGroungHorizontal
    })
    /**
     * 清除选中的竖背景图
     */
    dispatch({
      type: PlayAutoActions.UpdateBackGroundVertical,
      data: {}
    })
    /**
     * 清除选中的横背景图
     */
    dispatch({
      type: PlayAutoActions.UpdateBackGroundHorizontal,
      data: {}
    })
    /**
     * 清除个人信息
     */
    dispatch({
      type: LoginActions.ClearUserInfo,
    })
    /**
     * 更新横竖屏
     */
    dispatch({
      type: PlayAutoActions.UpdateDirection,
      data: true
    })
  },

});
export default connect(mapStateToProps, mapDispatchToProps)(Profile);
