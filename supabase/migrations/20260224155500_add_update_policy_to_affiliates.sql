-- Cria a política para permitir que o usuário logado atualize seu próprio registro de afiliado
CREATE POLICY "Users can update their own affiliate data"
ON public.affiliates
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
