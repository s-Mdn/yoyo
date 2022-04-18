import background_one_l from '@/assets/images/background-1.png';
import background_two_l from '@/assets/images/background-2.png';
import background_three_l from '@/assets/images/background-3.png';
import background_four_l from '@/assets/images/background-4.png';
import background_five_l from '@/assets/images/background-5.png';

import background_one_h from '@/assets/images/background-1-1.jpg';
import background_two_h from '@/assets/images/background-2-2.png';
import background_three_h from '@/assets/images/background-3-3.png';
import background_four_h from '@/assets/images/background-4-4.png';
import background_five_h from '@/assets/images/background-5-5.png';


// 竖向背景图
const backGroundListVertical = [
  {
    id: 999,
    checked: false,
    image: background_one_l,
  },
  {
    id: 998,
    checked: false,
    image: background_two_l,
  },
  {
    id: 997,
    checked: false,
    image: background_three_l,
  },
  {
    id: 996,
    checked: true,
    image: background_four_l,
  },
  {
    id: 995,
    checked: false,
    image: background_five_l,
  },
];

// 横向默认背景
const backgroundListHorizontal = [
  {
    id: 999,
    checked: false,
    image: background_one_h,
  },
  {
    id: 998,
    checked: false,
    image: background_two_h,
  },
  {
    id: 997,
    checked: false,
    image: background_three_h,
  },
  {
    id: 996,
    checked: true,
    image: background_four_h,
  },
  {
    id: 995,
    checked: false,
    image: background_five_h,
  },
];

const constData = {
  backGroundListL: backGroundListVertical,
  backGroundListH: backgroundListHorizontal
}
export default constData

