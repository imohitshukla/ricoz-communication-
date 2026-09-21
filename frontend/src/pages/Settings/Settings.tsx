import { Settings as SettingsIcon, User, Bell, Shield, Wallet, Globe } from 'lucide-react';

export function Settings() {
  return (
    <div className="p-8 max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8 shrink-0">
        <h1 className="text-2xl font-semibold flex items-center">
          <SettingsIcon className="w-8 h-8 text-brand-primary mr-3" />
          Workspace Settings
        </h1>
        <p className="text-secondary mt-1">Manage your account, billing, and system preferences.</p>
      </div>

      <div className="flex flex-1 gap-8 min-h-0">
        <div className="w-64 shrink-0 border-r border-border pr-4 space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg bg-sunken text-brand-primary font-medium text-sm transition-colors">
            <User className="w-4 h-4" /> <span>Profile & Account</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary hover:text-primary hover:bg-sunken font-medium text-sm transition-colors">
            <Globe className="w-4 h-4" /> <span>Workspace</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary hover:text-primary hover:bg-sunken font-medium text-sm transition-colors">
            <Bell className="w-4 h-4" /> <span>Notifications</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary hover:text-primary hover:bg-sunken font-medium text-sm transition-colors">
            <Shield className="w-4 h-4" /> <span>Security</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-secondary hover:text-primary hover:bg-sunken font-medium text-sm transition-colors">
            <Wallet className="w-4 h-4" /> <span>Billing & Plans</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-4 space-y-8">
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Profile Information</h3>
            <div className="flex items-center space-x-6 mb-6">
              <div className="w-20 h-20 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-2xl font-bold border-2 border-brand-primary">
                MS
              </div>
              <div>
                <button className="bg-sunken border border-border px-4 py-2 rounded-md hover:bg-base text-sm font-medium transition-colors mb-2">
                  Change Avatar
                </button>
                <p className="text-xs text-secondary">JPG, GIF or PNG. Max size of 800K</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">First Name</label>
                <input type="text" defaultValue="Mohit" className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">Last Name</label>
                <input type="text" defaultValue="Shukla" className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-secondary mb-1">Email Address</label>
                <input type="email" defaultValue="mohit@ricoz.com" className="w-full bg-base border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand-primary transition-colors" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="bg-brand-primary text-white px-4 py-2 rounded-md shadow-raised hover:opacity-90 transition-opacity font-medium text-sm">
                Save Changes
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm border-danger/20">
            <h3 className="text-lg font-semibold text-danger mb-2">Danger Zone</h3>
            <p className="text-sm text-secondary mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-danger/10 text-danger border border-danger/20 px-4 py-2 rounded-md hover:bg-danger hover:text-white transition-colors font-medium text-sm">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
