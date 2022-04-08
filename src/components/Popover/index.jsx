import { Popover, Avatar } from 'antd';
import content from './content.jsx';
const _Popover = (props) => {
  const { userInfo, loginOut } = props;
  return (
    <>
      <Popover
        title={null}
        trigger='click'
        content={content({ userInfo, loginOut })}
      >
        {userInfo.avatar ? (
          <img
            style={{ width: '32px', height: '32px', borderRadius: '100%' }}
            src={userInfo.avatar}
            alt=''
          />
        ) : (
          <Avatar src={<img src='https://joeschmoe.io/api/v1/random' alt='' style={{ width: '32px', height: '32px', borderRadius: '100%' }} />} />
        )}
      </Popover>
    </>
  );
};
export default _Popover;
