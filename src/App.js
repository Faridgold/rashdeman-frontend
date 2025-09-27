import React, { useState, useEffect } from 'react';
import './index.css';
import { User, AlertCircle, Send, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function App() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [challenges, setChallenges] = useState([]);
  const [newChallenge, setNewChallenge] = useState({ title: '', description: '', duration: '', penalty: '', charityId: 'charity1' });
  const [invitations, setInvitations] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [witnessEmail, setWitnessEmail] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [penalties, setPenalties] = useState([]);
  const [stats, setStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [charities, setCharities] = useState([]);

  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const backendUrl = 'https://irrelevant-martha-faryas-1395e69c.koyeb.app';
  

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${backendUrl}/profile/${user.id}`);
      setStats(response.data.stats);
      toast.success('آمار پروفایل به‌روزرسانی شد!');
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
      toast.error('خطا در گرفتن آمار پروفایل');
    }
  };

  useEffect(() => {
    if (user) {
      const fetchChallenges = async () => {
        try {
          const response = await axios.get(`${backendUrl}/challenges/${user.id}`);
          setChallenges(response.data);
        } catch (error) {
          console.error('Error fetching challenges:', error.response?.data || error.message);
          toast.error('خطا در گرفتن چالش‌ها');
        }
      };
      const fetchInvitations = async () => {
        try {
          const response = await axios.get(`${backendUrl}/invitations/${user.id}`);
          setInvitations(response.data);
        } catch (error) {
          console.error('Error fetching invitations:', error.response?.data || error.message);
          toast.error('خطا در گرفتن دعوت‌نامه‌ها');
        }
      };
      const fetchWeeklyStats = async () => {
        try {
          const response = await axios.get(`${backendUrl}/statistics/${user.id}`);
          setWeeklyStats(response.data.stats);
        } catch (error) {
          console.error('Error fetching weekly stats:', error.response?.data || error.message);
          toast.error('خطا در گرفتن آمار هفتگی');
        }
      };
      const fetchCharities = async () => {
        try {
          const response = await axios.get(`${backendUrl}/charities`);
          setCharities(response.data);
          console.log('Charities loaded:', response.data);
        } catch (error) {
          console.error('Error fetching charities:', error.response?.data || error.message);
          toast.error('خطا در گرفتن خیریه‌ها');
        }
      };
      fetchChallenges();
      fetchInvitations();
      fetchProfile();
      fetchWeeklyStats();
      fetchCharities();
    }
  }, [user, backendUrl]);

  const fetchPenalties = async (challengeId) => {
    try {
      const response = await axios.get(`${backendUrl}/challenges/${challengeId}/penalties`);
      setPenalties(response.data);
      setSelectedChallenge(challengeId);
    } catch (error) {
      console.error('Error fetching penalties:', error.response?.data || error.message);
      toast.error('خطا در گرفتن تاریخچه جریمه‌ها');
    }
  };

  const register = async () => {
    try {
      console.log('Register attempt:', { name, email, password });
      const response = await axios.post(`${backendUrl}/register`, {
        name,
        email,
        password
      });
      toast.success('ثبت‌نام موفقیت‌آمیز! حالا وارد شوید');
      setIsRegister(false);
      setName('');
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Register error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'خطا در ثبت‌نام');
    }
  };

  const login = async () => {
    try {
      console.log('Login attempt:', { email, password });
      const response = await axios.post(`${backendUrl}/login`, {
        email,
        password
      });
      setUser(response.data.user);
      setEmail('');
      setPassword('');
      toast.success('ورود موفقیت‌آمیز!');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'خطا در ورود');
    }
  };

  const createChallenge = async () => {
    try {
      const response = await axios.post(`${backendUrl}/challenges`, {
        userId: user.id,
        title: newChallenge.title,
        description: newChallenge.description,
        duration: newChallenge.duration,
        penalty: newChallenge.penalty,
        charityId: newChallenge.charityId
      });
      setChallenges([...challenges, response.data.challenge]);
      setNewChallenge({ title: '', description: '', duration: '', penalty: '', charityId: 'charity1' });
      toast.success('چالش با موفقیت ایجاد شد!');
    } catch (error) {
      console.error('Error creating challenge:', error.response?.data || error.message);
      toast.error('خطا در ایجاد چالش');
    }
  };

  const addPenalty = async (challengeId) => {
    try {
      const response = await axios.post(`${backendUrl}/challenges/${challengeId}/penalties`, {
        recordedBy: user.id
      });
      setChallenges(challenges.map(c => c.id === challengeId ? response.data.challenge : c));
      if (selectedChallenge === challengeId) {
        setPenalties([...penalties, response.data.penalty]);
      }
      toast.success('جریمه ثبت شد!');
    } catch (error) {
      console.error('Error adding penalty:', error.response?.data || error.message);
      toast.error('خطا در ثبت جریمه');
    }
  };

  const addWitness = async (challengeId) => {
    try {
      const response = await axios.post(`${backendUrl}/login`, { name: witnessEmail, email: witnessEmail });
      const witness = response.data.user;
      await axios.post(`${backendUrl}/challenges/${challengeId}/witnesses`, { witnessId: witness.id });
      setChallenges(challenges.map(c => c.id === challengeId ? { ...c, witnesses: [...c.witnesses, witness.id] } : c));
      setWitnessEmail('');
      toast.success('شاهد اضافه شد!');
    } catch (error) {
      console.error('Error adding witness:', error.response?.data || error.message);
      toast.error('خطا در اضافه کردن شاهد');
    }
  };

  const inviteFriend = async (challengeId) => {
    try {
      const response = await axios.post(`${backendUrl}/login`, { name: inviteEmail, email: inviteEmail });
      const invitedUser = response.data.user;
      await axios.post(`${backendUrl}/invitations`, {
        fromUserId: user.id,
        toUserId: invitedUser.id,
        challengeId
      });
      setInvitations([...invitations, { challengeId, toUserId: invitedUser.id, status: 'pending' }]);
      setInviteEmail('');
      toast.success('دعوت‌نامه ارسال شد!');
    } catch (error) {
      console.error('Error inviting friend:', error.response?.data || error.message);
      toast.error('خطا در ارسال دعوت‌نامه');
    }
  };

  const confirmPayment = async (challengeId) => {
    try {
      console.log('Confirming payment for:', { userId: user.id, challengeId });
      const response = await axios.post(`${backendUrl}/challenges/${challengeId}/confirm-payment`, {
        userId: user.id
      });
      console.log('Confirm payment response:', response.data);
      setChallenges(challenges.map(c => c.id === challengeId ? response.data.challenge : c));
      setStats({ ...stats, totalPenalties: stats.totalPenalties - challenges.find(c => c.id === challengeId).totalPenalty });
      setPenalties([]);
      toast.success('پرداخت تأیید شد و جریمه‌ها صفر شدند!');
    } catch (error) {
      console.error('Error confirming payment:', error.response?.data || error.message);
      toast.error('خطا در تأیید پرداخت');
    }
  };

  const setReminder = () => {
    toast.info('یادآوری روزانه تنظیم شد! (در آینده با نوتیفیکیشن توسعه می‌یابد)');
  };

  const chartData = selectedChallenge
    ? {
        labels: penalties.map(p => new Date(p.date).toLocaleDateString('fa-IR')),
        datasets: [
          {
            label: 'جریمه‌ها (تومان)',
            data: penalties.map(p => p.amount),
            borderColor: '#FF6384',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
          },
          {
            label: 'پیشرفت',
            data: penalties.map((_, index) => index + 1),
            borderColor: '#36A2EB',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
          },
        ],
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-green-100 p-4">
      {!user ? (
        <div className="max-w-md mx-auto mt-20">
          <h1 className="text-3xl font-bold text-center mb-4">رشدمن</h1>
          <div className="bg-white p-4 rounded shadow">
            <div className="flex mb-4">
              <button
                onClick={() => setIsRegister(false)}
                className={`flex-1 p-2 rounded ${!isRegister ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                ورود
              </button>
              <button
                onClick={() => setIsRegister(true)}
                className={`flex-1 p-2 rounded ${isRegister ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                ثبت‌نام
              </button>
            </div>
            {isRegister ? (
              <>
                <input
                  type="text"
                  placeholder="نام"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="email"
                  placeholder="ایمیل"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <button
                  onClick={register}
                  className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  ثبت‌نام
                </button>
              </>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="ایمیل"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <input
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 mb-2 border rounded"
                />
                <button
                  onClick={login}
                  className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  ورود
                </button>
              </>
            )}
            <p className="text-center mt-2">
              {isRegister ? (
                <>حساب دارید؟ <button onClick={() => setIsRegister(false)} className="text-blue-500">ورود</button></>
              ) : (
                <>حساب ندارید؟ <button onClick={() => setIsRegister(true)} className="text-blue-500">ثبت‌نام</button></>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-4">خوش آمدید، {user.name}</h1>

          {/* پروفایل کاربر */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">پروفایل</h2>
            {stats && (
              <div>
                <p>تعداد چالش‌ها: {stats.totalChallenges}</p>
                <p>چالش‌های فعال: {stats.activeChallenges}</p>
                <p>چالش‌های کامل: {stats.completedChallenges}</p>
                <p>کل جریمه‌ها: {stats.totalPenalties} تومان</p>
                {stats.totalPenalties >= 500000 && (
                  <>
                    <a
                      href={charities.find(c => c.id === challenges[0]?.charityId)?.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-500 flex items-center"
                    >
                      <Send className="ml-2" /> پرداخت به خیریه
                    </a>
                    <button
                      onClick={() => confirmPayment(challenges[0]?.id)}
                      className="mt-2 text-green-500 flex items-center"
                    >
                      <Send className="ml-2" /> تأیید پرداخت
                    </button>
                  </>
                )}
              </div>
            )}
            <button onClick={fetchProfile} className="mt-2 text-blue-500 flex items-center">
              <BarChart3 className="ml-2" /> به‌روزرسانی آمار
            </button>
          </div>

          {/* آمار هفتگی */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">آمار هفتگی</h2>
            {weeklyStats && (
              <div>
                <p>تعداد جریمه‌ها: {weeklyStats.weeklyCount}</p>
                <p>مجموع جریمه: {weeklyStats.weeklyTotalPenalty} تومان</p>
                <h3 className="text-sm font-semibold mt-2">تفکیک روزانه:</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="border p-1">تاریخ</th>
                      <th className="border p-1">تعداد</th>
                      <th className="border p-1">مبلغ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeklyStats.dailyBreakdown.map(day => (
                      <tr key={day.date}>
                        <td className="border p-1">{new Date(day.date).toLocaleDateString('fa-IR')}</td>
                        <td className="border p-1">{day.count}</td>
                        <td className="border p-1">{day.amount} تومان</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={setReminder} className="mt-2 text-blue-500 flex items-center">
                  <AlertCircle className="ml-2" /> تنظیم یادآوری روزانه
                </button>
              </div>
            )}
          </div>

          {/* فرم ایجاد چالش */}
          <div className="bg-white p-4 rounded shadow mb-4">
            <h2 className="text-xl font-semibold mb-2">ایجاد چالش جدید</h2>
            <input
              type="text"
              placeholder="عنوان چالش"
              value={newChallenge.title}
              onChange={(e) => setNewChallenge({ ...newChallenge, title: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <textarea
              placeholder="توضیحات (اختیاری)"
              value={newChallenge.description}
              onChange={(e) => setNewChallenge({ ...newChallenge, description: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="number"
              placeholder="مدت زمان (روز)"
              value={newChallenge.duration}
              onChange={(e) => setNewChallenge({ ...newChallenge, duration: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <input
              type="number"
              placeholder="جریمه (تومان)"
              value={newChallenge.penalty}
              onChange={(e) => setNewChallenge({ ...newChallenge, penalty: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            />
            <select
              value={newChallenge.charityId}
              onChange={(e) => setNewChallenge({ ...newChallenge, charityId: e.target.value })}
              className="w-full p-2 mb-2 border rounded"
            >
              {charities.map(charity => (
                <option key={charity.id} value={charity.id}>{charity.name}</option>
              ))}
            </select>
            <button
              onClick={createChallenge}
              className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              ایجاد چالش
            </button>
          </div>

          {/* نمایش چالش‌ها */}
          <div className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-2">چالش‌های من</h2>
            {challenges.length === 0 ? (
              <p className="text-gray-600">هنوز چالشی ندارید!</p>
            ) : (
              challenges.map(challenge => (
                <div key={challenge.id} className="mb-4 p-2 border rounded">
                  <h3 className="text-lg font-semibold">{challenge.title}</h3>
                  <p className="text-gray-600">{challenge.description}</p>
                  <p className="text-sm">مدت: {challenge.duration} روز</p>
                  <p className="text-sm">جریمه: {challenge.penalty} تومان</p>
                  <p className="text-sm">خیریه: {charities.find(c => c.id === challenge.charityId)?.name}</p>
                  <p className="text-sm">مجموع جریمه: {challenge.totalPenalty} تومان</p>
                  {challenge.totalPenalty >= 500000 && (
                    <>
                      <a
                        href={charities.find(c => c.id === challenge.charityId)?.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-500 flex items-center"
                      >
                        <Send className="ml-2" /> پرداخت به خیریه
                      </a>
                      <button
                        onClick={() => confirmPayment(challenge.id)}
                        className="mt-2 text-green-500 flex items-center"
                      >
                        <Send className="ml-2" /> تأیید پرداخت
                      </button>
                    </>
                  )}
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-500 h-2.5 rounded-full"
                        style={{ width: `${(challenge.progress / challenge.duration) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-sm mt-1">
                      پیشرفت: {challenge.progress}/{challenge.duration} روز
                    </p>
                  </div>
                  <button
                    onClick={() => addPenalty(challenge.id)}
                    className="mt-2 flex items-center text-red-500"
                  >
                    <AlertCircle className="ml-2" /> ثبت جریمه
                  </button>
                  <button
                    onClick={() => fetchPenalties(challenge.id)}
                    className="mt-2 flex items-center text-blue-500"
                  >
                    <User className="ml-2" /> تاریخچه جریمه‌ها
                  </button>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="ایمیل شاهد (مثال: witness@example.com)"
                      value={witnessEmail}
                      onChange={(e) => setWitnessEmail(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                    />
                    <button
                      onClick={() => addWitness(challenge.id)}
                      className="flex items-center text-green-500"
                    >
                      <Send className="ml-2" /> اضافه کردن شاهد
                    </button>
                  </div>
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="ایمیل دوست (مثال: user2@example.com)"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full p-2 mb-2 border rounded"
                    />
                    <button
                      onClick={() => inviteFriend(challenge.id)}
                      className="flex items-center text-green-500"
                    >
                      <Send className="ml-2" /> دعوت دوست
                    </button>
                  </div>
                  {selectedChallenge === challenge.id && penalties.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-semibold">تاریخچه جریمه‌ها:</h4>
                      <ul>
                        {penalties.map(penalty => (
                          <li key={penalty.id} className="text-sm text-gray-600">
                            {new Date(penalty.date).toLocaleDateString('fa-IR')}: {penalty.amount} تومان (ثبت توسط {penalty.recordedBy})
                          </li>
                        ))}
                      </ul>
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold">گراف جریمه‌ها و پیشرفت</h5>
                        {chartData && (
                          <div style={{ height: '200px' }}>
                            <Line data={chartData} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* نمایش دعوت‌نامه‌ها */}
          <div className="bg-white p-4 rounded shadow mt-4">
            <h2 className="text-xl font-semibold mb-2">دعوت‌نامه‌ها</h2>
            {invitations.length === 0 ? (
              <p className="text-gray-600">هنوز دعوت‌نامه‌ای ندارید!</p>
            ) : (
              invitations.map(invitation => (
                <div key={invitation.id} className="mb-2 p-2 border rounded">
                  <p className="text-sm">دعوت از کاربر {invitation.fromUserId} برای چالش {invitation.challengeId}</p>
                  <p className="text-sm">وضعیت: {invitation.status}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;