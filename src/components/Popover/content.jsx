import { validate, type } from '@/utils';


const content = (props) => {
  const { userInfo } = props;
  return (
    <div className='text-center'>
      <header className='py-2 cursor-default'>
        {validate.hidePhoneNum(
          type.toString(userInfo.phone_num)
        )}
      </header>
      <footer
        className='py-1 border-t font_12 cursor-default'
        onClick={props.loginOut}
      >
        退 出
      </footer>
    </div>
  );
};
export default content;
