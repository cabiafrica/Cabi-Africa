-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Policies

-- 1. Users table
-- Users can see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id);

-- 2. Driver Profiles
-- Users can view their own driver profile
CREATE POLICY "Users can view own driver profile" ON public.driver_profiles
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- Users can update their own driver profile
CREATE POLICY "Users can update own driver profile" ON public.driver_profiles
  FOR UPDATE
  USING (auth.uid()::text = "userId");

-- 3. Rides
-- Passengers can view their rides
CREATE POLICY "Passengers can view own rides" ON public.rides
  FOR SELECT
  USING (auth.uid()::text = "passengerId");

-- Drivers can view their assigned rides
CREATE POLICY "Drivers can view assigned rides" ON public.rides
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = rides."driverId"
      AND dp."userId" = auth.uid()::text
    )
  );

-- 4. Vehicles
-- Drivers can view their own vehicle
CREATE POLICY "Drivers can view own vehicle" ON public.vehicles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = vehicles."driverProfileId"
      AND dp."userId" = auth.uid()::text
    )
  );

-- 5. Organizations
-- Public read access to organizations
CREATE POLICY "Organizations are viewable by everyone" ON public.organizations
  FOR SELECT
  USING (true);

-- 6. Organization Members
-- Members can view their own membership
CREATE POLICY "Members can view own membership" ON public.organization_members
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- 7. Invitations
-- Drivers can view invitations sent to their driver profile
CREATE POLICY "Drivers can view received invitations" ON public.invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = invitations."driverId"
      AND dp."userId" = auth.uid()::text
    )
  );

-- 8. Documents
-- Drivers can view their own documents
CREATE POLICY "Drivers can view own documents" ON public.documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.driver_profiles dp
      WHERE dp.id = documents."driverProfileId"
      AND dp."userId" = auth.uid()::text
    )
  );
