import { describe,it,expect } from 'vitest';
import { emailRedirect, accountConfig } from '@/lib/account-config';
import { freeTweaks, preferenceSchema, passwordSchema, registerSchema, safeCsvCell, adminFilterSchema } from '@/lib/account-rules';
describe('VTweaks product and security rules',()=>{
 it('keeps exactly the five essential Free tweaks',()=>{expect(freeTweaks).toEqual(['Explorador','Game Mode','Actividad de navegadores en segundo plano','Transparencia','Iluminación dinámica'])});
 it('keeps confirmation on the currently approved redirect host',()=>{expect(emailRedirect('confirm')).toBe('https://vtweaks-landing.vercel.app/?auth=confirm')});
 it('keeps recovery on the currently approved redirect host',()=>{expect(emailRedirect('recovery')).toBe('https://vtweaks-landing.vercel.app/?auth=recovery')});
 it('uses only the existing account project',()=>{expect(accountConfig.url).toBe('https://rybwxspbtleugpfjdybx.supabase.co')});
 it('allows an 80 character preference name and rejects 81',()=>{expect(preferenceSchema.safeParse({name:'a'.repeat(80),marketing:false}).success).toBe(true);expect(preferenceSchema.safeParse({name:'a'.repeat(81),marketing:false}).success).toBe(false)});
 it('requires passwords of at least ten characters',()=>{expect(passwordSchema.safeParse('123456789').success).toBe(false);expect(passwordSchema.safeParse('1234567890').success).toBe(true)});
 it('requires matching registration passwords',()=>{expect(registerSchema.safeParse({email:'mock@example.test',password:'password123',confirm:'notmatching',marketing:false}).success).toBe(false)});
 it('keeps optional consent false when explicitly declined',()=>{expect(registerSchema.parse({email:'mock@example.test',password:'password123',confirm:'password123',marketing:false}).marketing).toBe(false)});
 it('prevents spreadsheet formula injection in exported cells',()=>{expect(safeCsvCell(' =HYPERLINK("bad")')).toBe('"\' =HYPERLINK(""bad"")"');expect(safeCsvCell('normal')).toBe('"normal"')});
 it('rejects unrecognized admin filters',()=>{expect(adminFilterSchema.safeParse({search:'',status:'admin',plan:'all',marketing:'all'}).success).toBe(false)});
});

