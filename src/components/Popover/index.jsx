import { Popover } from 'antd';
import content from './content.jsx';
const _Popover = (props) => {
  const { userInfo, loginOut } = props
  return (
    <>
      <Popover title={null} content={content({userInfo, loginOut})}>
        <img
          style={{ width: '32px', height: '32px', borderRadius: '100%' }}
          src={userInfo.avatar}
          alt=''
        />
      </Popover>
    </>
  );
};
export default _Popover
