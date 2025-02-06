import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr/ClockCounterClockwise';
import { Wrench  } from '@phosphor-icons/react/dist/ssr/Wrench';
import { ArrowUUpLeft  } from '@phosphor-icons/react/dist/ssr/ArrowUUpLeft';
import { HouseSimple  } from '@phosphor-icons/react/dist/ssr/HouseSimple';
import { BookmarkSimple  } from '@phosphor-icons/react/dist/ssr/BookmarkSimple';
import { CardsThree } from '@phosphor-icons/react/dist/ssr/CardsThree';



export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  'history': ClockCounterClockwise,
  'tool': Wrench,
  'return': ArrowUUpLeft,
  'room': HouseSimple,
  'borrow': BookmarkSimple,
  'cards-thress': CardsThree,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
