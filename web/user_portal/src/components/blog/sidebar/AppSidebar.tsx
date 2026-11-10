import RequestRideWidget from './RequestRideWidget';
import RegisterCTAWidget from './RegisterCTAWidget';
import DownloadAppWidget from './DownloadAppWidget';

export default function AppSidebar() {
    return (
        <aside className="space-y-5">
            <RequestRideWidget />
            <RegisterCTAWidget />
            <DownloadAppWidget />
        </aside>
    );
}
