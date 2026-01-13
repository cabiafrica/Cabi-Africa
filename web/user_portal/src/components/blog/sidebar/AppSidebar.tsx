import TripRequestWidget from './TripRequestWidget';
import RegisterCTAWidget from './RegisterCTAWidget';
import DownloadAppWidget from './DownloadAppWidget';

export default function AppSidebar() {
    return (
        <aside className="space-y-6">
            <TripRequestWidget />
            <RegisterCTAWidget />
            <DownloadAppWidget />
        </aside>
    );
}
