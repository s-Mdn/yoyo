import { Popover } from 'antd';
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
        <img style={{ width: '32px', height: '32px', borderRadius: '100%' }}
          src={userInfo.avatar || 'https://joeschmoe.io/api/v1/random'}
          alt='' />
      </Popover>
    </>
  );
};
export default _Popover;
