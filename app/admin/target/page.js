import TargetClient from './TargetClient'
import { getTargetDays } from '@/lib/api/targets';

export const dynamic = 'force-dynamic';

const TargetDates = async () => {
    const targetdates = await getTargetDays();
    return <TargetClient initialTargets={targetdates} />;
}

export default TargetDates