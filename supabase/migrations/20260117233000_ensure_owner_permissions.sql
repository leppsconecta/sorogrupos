-- Ensure companies can be updated by their owners
DROP POLICY IF EXISTS "Allow owners to update their company" ON public.companies;
CREATE POLICY "Allow owners to update their company"
ON public.companies
FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Ensure companies can be inserted by their owners (if needed for registration flow, though claim-account handles this usually)
-- Adding just in case manual insertion is needed later or for consistency
DROP POLICY IF EXISTS "Allow owners to insert their company" ON public.companies;
CREATE POLICY "Allow owners to insert their company"
ON public.companies
FOR INSERT
WITH CHECK (auth.uid() = owner_id);
