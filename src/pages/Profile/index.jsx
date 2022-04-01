import React from 'react';
import { connect } from 'react-redux';
import { Upload, Input, message, Radio } from 'antd';
import { EditOutlined, CameraTwoTone } from '@ant-design/icons';
import utils from '@/utils'
import API from '@/services';
import action from '@/actions'
import './index.less';
import defaultAvatar from '@/assets/images/character_model_yoyo.png';

const { validate, type, auth } = utils
const { profile, quality } = action

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nickName: '',     // 昵称
      nickNamer: '',    // 昵称输入框占位符
      resetName: false, // 重制网名窗口
      avatar: '',       // 头像
      hidePhoneNum: '', // 处理后的电话号码
    };
  }

  // 修改网名窗口
  handleResetName = (bol) => {
    this.setState({ resetName: bol });
  };

  // 确认修改网名
  handleComfimrResetName = async () => {
    if(!this.state.nickNamer) {
      message.warn('昵称不能为空字符')
      return false
    }
    let response = null;
    let data = {
      avatar: this.state.avatar,
      nickname: this.state.nickNamer,
    }
    try {
      response = await API.profileApi.updataProfile(data);
      console.log( response )
    } catch (error) {
      return false;
    }

    if(response && response.code === 200 && response.data) {
      auth.setLocal('userInfo', type.toString(response.data))
      this.setState({resetName: false})
      this.props.handleProfile(response.data)
    }
  };

  // 上传先钩子函数
  handleBeforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('图片不能超过5mb!');
    }
    const isJpgOrPng =
      file.type === 'image/jpeg' ||
      file.type === 'image/png' ||
      file.type === 'image/gif' ||
      file.type === 'image/webp';

    if (!isJpgOrPng) {
      message.error('只能上传JPG/PNG/GIF/WEBP的文件');
    }
    return isJpgOrPng && isLt5M;
  };

  // Upload 组件方法
  handleChange = ({ fileList, file }) => {
    this.setState({
      avatar: file.response?.data
    })
    let userInfo = auth.getLocal('userInfo') && JSON.parse(auth.getLocal('userInfo'))
    userInfo.avatar = file.response?.data
    auth.setLocal('userInfo', type.toString(userInfo))
    this.props.handleProfile(userInfo)
  };

  // Radio事件
  handleRadioChange = (e) => {
    console.log(e.target.value)
  }
  // 上传图片参数
  data = (file) => {
    const suffix = file.name.slice(file.name.lastIndexOf('.'));
    return {
      suffix: suffix,
      preffix: 'feedbackImg',
    };
  };

  componentDidMount() {
    this.setState({
      avatar: this.props.userInfo.avatar,
      nickName: this.props.userInfo.nickname,
      hidePhoneNum: validate.hidePhoneNum(type.toString(this.props.userInfo.phone_num))
    });
  }

  render() {
    const { avatar, nickName, resetName, hidePhoneNum } = this.state
    const { radioValue, handleRadioChange } = this.props
    return (
      <div className='profile overflow-hidden box-border'>
        <div className='bg-white rounder relative profile_h_full'>
          <div className='base_info'>
            <div className='flex mt-8'>
              <div className='ml-8 image_box h_w_100 rounded overflow-hidden flex-none'>
                {
                  <Upload
                    beforeUpload={this.handleBeforeUpload}
                    onChange={this.handleChange}
                    data={(file) => this.data(file)}
                    action={`${process.env.REACT_APP_API}/api/common/upload`}
                    accept='.jpg, .png, .gif, .webp'
                  >
                    {avatar? (
                      <div className='relative avatar h-full'>
                        <img
                          className='h-full'
                          src={avatar}
                          alt=''
                        />
                        <div className='absolute top-0 left-0 z-10 h_w_100 rounded text-center hidden flex-col justify-center avatar_model'>
                          <CameraTwoTone twoToneColor='#fff' />
                          <p
                            style={{ marginTop: '10px' }}
                            className='font_12 text-white'
                          >
                            修改我的头像
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className='h_w_100 border-0 overflow-hidden relative avatar'>
                        <img
                          className='w-full border-0 '
                          src={defaultAvatar}
                          alt=''
                        />
                        <div className='absolute top-0 left-0 z-10 h_w_100 rounded text-center hidden flex-col justify-center avatar_model'>
                          <CameraTwoTone twoToneColor='#fff' />
                          <p
                            style={{ marginTop: '10px' }}
                            className='font_12 text-white'
                          >
                            上传头像
                          </p>
                        </div>
                      </div>
                    )}
                  </Upload>
                }
              </div>
              <div className='ml-8 w__60 box-border pr-8'>
                <div className='p_t_b_30 form border-b'>
                  {!resetName ? (
                    <div className='font_26  font-semibold flex items-center'>
                      <span className='mr-4 text-black'>{nickName}</span>
                      <div
                        className='cursor-pointer'
                        onClick={() => this.handleResetName(true)}
                      >
                        <EditOutlined />
                      </div>
                    </div>
                  ) : (
                    <div className='flex items-start'>
                      <label className='font_15 w_120 color-444 font-semibold mr-4 flex-none'>
                        用户名
                      </label>
                      <div>
                        <Input
                          style={{  width: '420px', border: '1px solid #ccc',  }}
                          value={this.state.nickNamer}
                          onChange={e =>{
                            this.setState({nickNamer: e.target.value})
                          }
                          }
                        />
                        <p className='mt-6'>
                          <button
                            className='btn-confime px-4 py-1 text-center rounded bg-001529 color-666'
                            onClick={this.handleComfimrResetName}
                          >
                            确认
                          </button>
                          <button
                            className='btn-cancel  px-4 py-1 rounded border ml-4'
                            onClick={() => this.handleResetName(false)}
                          >
                            取消
                          </button>
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className='p_t_b_30 form border-b'>
                  <div className='font_15 color-444 font-semibold flex items-center'>
                    <span className='mr-4 w_120'>手机号码</span>
                    <div className='cursor-pointer'>{ hidePhoneNum }</div>
                  </div>
                </div>

                <div className='p_t_b_30 form border-b'>
                  <div className='font_15 color-444 font-semibold flex items-center'>
                    <span className='mr-4 w_120'>账户密码</span>
                    <div className='cursor-pointer'>******</div>
                  </div>
                </div>

                <div className='p_t_b_30 form border-b'>
                  <div className='font_15 color-444 font-semibold flex items-center'>
                    <span className='mr-4 w_120'>版本类型</span>
                    <div className='cursor-pointer'>v1.4</div>
                  </div>
                </div>

                <div className='p_t_b_30 form border-b'>
                  <div className='font_15 color-444 font-semibold flex items-center'>
                    <span className='mr-4 w_120'>动画质量</span>
                    <div className='cursor-pointer flex'>
                      <Radio.Group onChange={e => handleRadioChange(e.target.value)} value={radioValue}>
                        <Radio value={'FLUENCY'}>流畅</Radio>
                        <Radio value={'MEDIUM'}>平衡</Radio>
                        <Radio value={'HEIGHT'}>高清</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => ({
  handleProfile: (data) =>{
    dispatch(profile.addProfile(data))
  },
  handleRadioChange: (value) => {
    dispatch(quality.handleChange(value))
  }
});

const mapStateToProps = (state) => ({
  userInfo: state.profile,
  radioValue: state.quality
});

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
