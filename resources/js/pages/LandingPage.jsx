import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, TrendingUp, Shield, Users, Star, ChevronDown, Zap, BarChart2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Cell } from 'recharts'
import { motion } from 'framer-motion'

// Brand colors
const TEAL   = '#066A6F'
const NAVY   = '#102A43'
const PGREEN = '#2FBF71'
const GOLD   = '#F4B000'
const CORAL  = '#F56A6A'

const stats = [
  { value: '94%',   label: 'Completion rate' },
  { value: '127',   label: 'Avg. score gain (pts)' },
  { value: '3.2',   label: 'Avg. months to Good credit' },
  { value: '500+', label: 'Homeowners created' },
]

const steps = [
  { number:'01', title:'Enroll & attend classes', desc:'Join structured homeownership curriculum. Track attendance automatically and earn progress milestones.', accent: TEAL },
  { number:'02', title:'Submit monthly scores',   desc:'Upload your credit score each month. Our engine analyzes your standing and triggers the right coaching path.', accent: PGREEN },
  { number:'03', title:'Get coaching',           desc:'Receive a personalized Coaching Card — step-by-step guidance to repair, rebuild, and elevate your credit.', accent: GOLD },
  { number:'04', title:'Unlock the loan gateway', desc:'Hit Good credit status and your Loan Assistance module unlocks automatically.', accent: CORAL },
]



// Demo chart data
const heroScoreData = [
  { month:'Oct', score:498 },{ month:'Nov', score:521 },{ month:'Dec', score:549 },
  { month:'Jan', score:580 },{ month:'Feb', score:610 },{ month:'Mar', score:648 },
  { month:'Apr', score:712 },
]



function CountUp({ target }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const numeric = parseFloat(target.replace(/[^0-9.]/g,''))
    const dur=1800, steps=60, inc=numeric/steps
    let cur=0
    const t=setInterval(()=>{cur+=inc;if(cur>=numeric){setCount(numeric);clearInterval(t)}else setCount(parseFloat(cur.toFixed(1)))}, dur/steps)
    return ()=>clearInterval(t)
  },[target])
  return <>{target.replace(/[\d.]+/, count)}</>
}

const CustomAreaTooltip = ({active,payload,label}) => {
  if(!active||!payload?.length) return null
  const s=payload[0].value
  const color=s>=670?PGREEN:s>=580?GOLD:CORAL
  return (
    <div className="card px-4 py-3 text-sm shadow-lg border-0" style={{minWidth:100}}>
      <p className="text-xs mb-1" style={{color:'#6B7280'}}>{label}</p>
      <p className="font-display font-bold text-lg" style={{color}}>{s}</p>
    </div>
  )
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(()=>{const fn=()=>setScrolled(window.scrollY>40);window.addEventListener('scroll',fn);return ()=>window.removeEventListener('scroll',fn)},[])

  return (
    <div className="min-h-screen overflow-x-hidden" style={{background:'#F9F5EF'}}>

      {/* ── Nav ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?'bg-white/92 backdrop-blur-md border-b shadow-sm':''}` } style={scrolled?{borderColor:'#E3E6EC'}:{}}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-sm" style={{background:TEAL}}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                <circle cx="10" cy="10" r="2.5" fill="#2FBF71"/>
                <circle cx="10" cy="10" r="1" fill="white"/>
              </svg>
            </div>
            <div>
              <span className="font-display font-bold text-lg" style={{color:NAVY}}>MyScoreNova</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[['#how-it-works','How it works'],['#features','Features'],['#charts','See it in action'],['#testimonials','Stories']].map(([href,label])=>(
              <a key={href} href={href} className="text-sm transition-colors hover:opacity-70" style={{color:NAVY}}>{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium px-3 py-2 transition-colors" style={{color:NAVY}}>Sign in</Link>
            <Link to="/signup" className="btn-primary text-sm py-2 px-5 shadow-glow-sm">Get started <ArrowRight size={15}/></Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden">
        <div className="absolute inset-0" style={{background:'linear-gradient(150deg,#e6f4f4 0%,#F9F5EF 45%,#fef9e6 100%)'}} />
        <div className="absolute top-20 right-0 w-[700px] h-[700px] rounded-full blur-3xl z-0 translate-x-1/3 pointer-events-none" style={{background:'rgba(6,106,111,0.07)'}}/>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl z-0 -translate-x-1/3 pointer-events-none" style={{background:'rgba(244,176,0,0.08)'}}/>

        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-fade-up">
            <div className="section-tag mb-8">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{background:PGREEN}}/>
              {/* Homeownership automation program */}
            </div>
            <h1 className="font-display text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.08] mb-6" style={{color:NAVY}}>
              Your score.<br/>
              Your <span className="text-gradient-teal italic">nova</span>.<br/>
              Your home.
            </h1>
            <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{color:'#6B7280'}}>
              MyScoreNova guides future homeowners from bad credit to loan-ready through personalized coaching, class tracking, and automated financial routing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-3.5 shadow-glow-teal">
                Start your journey <ArrowRight size={18}/>
              </Link>
              <a href="#how-it-works" className="btn-secondary text-base px-8 py-3.5">
                See how it works
              </a>
            </div>
          </div>

          {/* Hero card with live chart */}
          <div className="animate-fade-up animate-delay-200 hidden lg:block">
            <div className="relative group/HeroCard">
              <div className="absolute -inset-1 bg-linear-to-r from-teal-500 to-emerald-500 rounded-4xl blur opacity-20 group-hover/HeroCard:opacity-40 transition duration-1000 group-hover/HeroCard:duration-200" />
              <div className="card p-6 shadow-2xl relative bg-white/80 backdrop-blur-md border-white/60 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <TrendingUp size={120} style={{color:PGREEN}} />
                </div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{color:'#6B7280'}}>Secure Portfolio Analysis</p>
                    <p className="font-display text-2xl font-black tracking-tight" style={{color:NAVY}}>+214 pts Trajectory</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100 italic">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> 
                     Optimal Route
                  </div>
                </div>
                <div className="relative z-10">
                  <ResponsiveContainer width="100%" height={140}>
                    <AreaChart data={heroScoreData} margin={{top:5,right:5,bottom:0,left:-20}}>
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={PGREEN} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={PGREEN} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" tick={{fontSize:10,fill:'#6B7280', fontWeight: 'bold'}} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CustomAreaTooltip/>}/>
                      <Area type="monotone" dataKey="score" stroke={PGREEN} strokeWidth={3} fill="url(#heroGrad)" dot={{r:4,fill:PGREEN,strokeWidth:0}} activeDot={{r:6, strokeWidth: 0}}/>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section style={{background:NAVY}} className="py-16 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s,i)=>(
              <div key={i} className="text-center">
                <p className="font-display text-4xl font-bold text-white mb-2"><CountUp target={s.value}/></p>
                <p className="text-sm" style={{color:'#4db2b2'}}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="section-tag mx-auto mb-4">The journey</div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold mb-4" style={{color:NAVY}}>Four steps to your front door</h2>
          <p className="max-w-xl mx-auto" style={{color:'#6B7280'}}>An automated pipeline that cultivates mortgage-ready candidates from the ground up.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step,i)=>(
            <div key={i} className="card-hover p-6 group">
              <div className="font-mono text-5xl font-bold mb-4 leading-none transition-colors" style={{color:`${step.accent}22`}}>{step.number}</div>
              <div className="w-1 h-6 rounded-full mb-4 transition-all" style={{background:step.accent}}/>
              <h3 className="font-display text-lg font-semibold mb-2" style={{color:NAVY}}>{step.title}</h3>
              <p className="text-sm leading-relaxed" style={{color:'#6B7280'}}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Credit triage ── */}
      <section className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="section-tag mx-auto mb-4">Automatic routing</div>
          <h2 className="font-display text-4xl font-bold" style={{color:NAVY}}>The credit triage engine</h2>
        </div>
        <div className="card p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="card px-6 py-4 font-medium text-center whitespace-nowrap shrink-0" style={{color:NAVY,background:'#F9F5EF'}}>Monthly score input</div>
            <div className="text-2xl hidden lg:block" style={{color:'#E3E6EC'}}>→</div>
            <div className="flex flex-col gap-4 flex-1 w-full">
              {[
                [CORAL,'Bad credit (< 580)','Routes to aggressive credit rehabilitation & dispute automation'],
                [GOLD,'Low credit (580–669)','Routes to targeted debt-management coaching modules'],
                [PGREEN,'Good credit (670+)','Routes automatically to the Loan Assistance Gateway'],
              ].map(([c,label,action])=>(
                <div key={label} className="flex items-center gap-4 p-4 rounded-xl border hover:border-opacity-50 transition-colors" style={{background:'#F9F5EF',borderColor:'#E3E6EC'}}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{background:c}}/>
                  <span className="font-medium text-sm w-44 shrink-0" style={{color:NAVY}}>{label}</span>
                  <span className="text-sm" style={{color:'#6B7280'}}>{action}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center text-xs mt-8" style={{color:'#6B7280'}}>Replaces manual file reviews with automated, color-coded status triggers</p>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" style={{background:NAVY}} className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-4" style={{borderColor:'rgba(6,106,111,0.4)',background:'rgba(6,106,111,0.15)',color:'#4db2b2'}}>
              <Star size={14} fill="currentColor"/> Real stories
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white">Their path. Their home.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {q:'"I went from a 498 to a 712 in seven months. The coaching cards told me exactly what to do."',n:'Alex J.',s:'498 → 712',m:'7 months',i:'AJ'},
              {q:'"When the Loan Gateway finally unlocked, I cried. Closing on my house next month."',n:'Sarah K.',s:'621 → 745',m:'9 months',i:'SK'},
              {q:'"As a counselor, the Watchtower dashboard cut my review time from hours to minutes."',n:'Counselor T.',s:'Admin view',m:'Staff',i:'CT'},
            ].map((t,i)=>(
              <motion.div key={i} initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay: i*0.1}}
                className="rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group relative overflow-hidden" 
                style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Star size={40} className="text-teal-500/20" />
                </div>
                <p className="text-base leading-relaxed mb-8 italic font-display relative z-10" style={{color:'rgba(255,255,255,0.9)'}}>{t.q}</p>
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-bold shadow-lg shadow-teal-900/20 group-hover:scale-110 transition-transform duration-500" style={{background:TEAL,color:'white'}}>{t.i}</div>
                  <div>
                    <p className="text-white text-sm font-black tracking-tight">{t.n}</p>
                    <p className="text-xs font-bold" style={{color:'#4db2b2'}}>{t.s} · {t.m}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative pt-20 pb-10 bg-white" style={{borderTop:'1px solid #E3E6EC'}}>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 lg:gap-8 mb-16">
            {/* Brand Area */}
            <div className="max-w-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-glow-sm" style={{background:TEAL}}>
                  <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
                    <path d="M10 2L17 6.5V13.5L10 18L3 13.5V6.5L10 2Z" stroke="white" strokeWidth="1.5" fill="none"/>
                    <circle cx="10" cy="10" r="2.5" fill="#2FBF71"/>
                    <circle cx="10" cy="10" r="1" fill="white"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-xl" style={{color:NAVY}}>MyScoreNova</span>
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{color:'#6B7280'}}>
                Guiding future homeowners from bad credit to loan-ready through personalized coaching and automated financial routing.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-semibold mb-6 text-sm tracking-wide uppercase" style={{color:NAVY}}>Company</h4>
              <ul className="space-y-4">
                <li><a href="#how-it-works" className="text-sm hover:opacity-70 transition-colors" style={{color:'#6B7280'}}>How it works</a></li>
                <li><a href="#features" className="text-sm hover:opacity-70 transition-colors" style={{color:'#6B7280'}}>Features & Engine</a></li>
                <li><a href="#testimonials" className="text-sm hover:opacity-70 transition-colors" style={{color:'#6B7280'}}>Success Stories</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{borderTop:'1px solid #E3E6EC'}}>
            <p className="text-xs" style={{color:'#6B7280'}}>© {(new Date()).getFullYear()} MyScoreNova. All rights reserved.</p>
            <div className="flex gap-6">
              <Link to="/admin/login" className="text-xs hover:opacity-70 transition-colors font-medium" style={{color:NAVY}}>Admin Login</Link>
              <Link to="/signup" className="text-xs hover:opacity-70 transition-colors font-medium" style={{color:TEAL}}>Client Enrollment</Link>
            </div>
          </div>
        </div>
        {/* Subtle decorative elements */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-3xl translate-x-1/3 -translate-y-1/2 pointer-events-none" style={{background:'rgba(6,106,111,0.02)', zIndex: 0}}/>
      </footer>
    </div>
  )
}