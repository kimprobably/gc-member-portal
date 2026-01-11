import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Sparkles, BarChart3 } from 'lucide-react';
import { Campaign } from '../../../types/gc-types';

interface CampaignAnalyticsProps {
  campaigns: Campaign[];
  isDarkMode: boolean;
}

const CampaignAnalytics: React.FC<CampaignAnalyticsProps> = ({ campaigns, isDarkMode }) => {
  // Aggregate metrics across all campaigns
  const totals = useMemo(() => {
    return campaigns.reduce(
      (acc, campaign) => ({
        contactsReached: acc.contactsReached + campaign.metrics.contactsReached,
        opens: acc.opens + campaign.metrics.opens,
        replies: acc.replies + campaign.metrics.replies,
        positiveReplies: acc.positiveReplies + campaign.metrics.positiveReplies,
        meetingsBooked: acc.meetingsBooked + campaign.metrics.meetingsBooked,
      }),
      { contactsReached: 0, opens: 0, replies: 0, positiveReplies: 0, meetingsBooked: 0 }
    );
  }, [campaigns]);

  // Calculate conversion rates
  const rates = useMemo(() => {
    const openRate = totals.contactsReached > 0 ? (totals.opens / totals.contactsReached) * 100 : 0;
    const replyRate = totals.opens > 0 ? (totals.replies / totals.opens) * 100 : 0;
    const positiveRate = totals.replies > 0 ? (totals.positiveReplies / totals.replies) * 100 : 0;
    const meetingRate =
      totals.positiveReplies > 0 ? (totals.meetingsBooked / totals.positiveReplies) * 100 : 0;

    return { openRate, replyRate, positiveRate, meetingRate };
  }, [totals]);

  // Funnel data
  const funnelData = useMemo(
    () => [
      { name: 'Reached', value: totals.contactsReached, fill: '#3b82f6' },
      { name: 'Opens', value: totals.opens, fill: '#6366f1' },
      { name: 'Replies', value: totals.replies, fill: '#8b5cf6' },
      { name: 'Positive', value: totals.positiveReplies, fill: '#a855f7' },
      { name: 'Meetings', value: totals.meetingsBooked, fill: '#22c55e' },
    ],
    [totals]
  );

  // Campaign comparison data for bar chart
  const campaignComparisonData = useMemo(() => {
    return campaigns
      .filter((c) => c.status === 'Live' || c.metrics.contactsReached > 0)
      .slice(0, 6)
      .map((campaign) => ({
        name:
          campaign.campaignName.length > 15
            ? campaign.campaignName.substring(0, 15) + '...'
            : campaign.campaignName,
        reached: campaign.metrics.contactsReached,
        replies: campaign.metrics.replies,
        meetings: campaign.metrics.meetingsBooked,
      }));
  }, [campaigns]);

  // AI-generated insights
  const insights = useMemo(() => {
    const insightsList: string[] = [];

    if (rates.openRate > 50) {
      insightsList.push('Excellent open rate! Your subject lines are working well.');
    } else if (rates.openRate < 20) {
      insightsList.push(
        'Low open rate detected. Consider A/B testing subject lines or improving deliverability.'
      );
    }

    if (rates.replyRate > 5) {
      insightsList.push('Strong reply rate indicates good message-market fit.');
    } else if (rates.replyRate < 1) {
      insightsList.push(
        'Low reply rate. Try personalizing your messaging or refining your ICP targeting.'
      );
    }

    if (rates.positiveRate > 30) {
      insightsList.push('High positive reply ratio - your value proposition is resonating!');
    }

    if (rates.meetingRate > 50) {
      insightsList.push('Great meeting conversion from positive replies.');
    } else if (rates.meetingRate < 20 && totals.positiveReplies > 5) {
      insightsList.push('Consider improving your meeting booking process or follow-up timing.');
    }

    const liveCampaigns = campaigns.filter((c) => c.status === 'Live').length;
    if (liveCampaigns === 0) {
      insightsList.push('No live campaigns running. Launch campaigns to start generating leads.');
    }

    if (insightsList.length === 0) {
      insightsList.push('Continue tracking metrics to unlock personalized insights.');
    }

    return insightsList;
  }, [rates, totals, campaigns]);

  // Rate indicator component
  const RateIndicator: React.FC<{ rate: number; benchmark: number; label: string }> = ({
    rate,
    benchmark,
    label,
  }) => {
    const isGood = rate >= benchmark;
    const isNeutral = Math.abs(rate - benchmark) < benchmark * 0.2;

    return (
      <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {label}
          </span>
          {isNeutral ? (
            <Minus className="w-4 h-4 text-slate-400" />
          ) : isGood ? (
            <TrendingUp className="w-4 h-4 text-green-500" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500" />
          )}
        </div>
        <p
          className={`text-2xl font-bold ${
            isNeutral
              ? isDarkMode
                ? 'text-slate-300'
                : 'text-slate-700'
              : isGood
                ? 'text-green-500'
                : 'text-red-500'
          }`}
        >
          {rate.toFixed(1)}%
        </p>
      </div>
    );
  };

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className={`w-5 h-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
        <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          Analytics Overview
        </h2>
      </div>

      {/* Conversion Rates */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <RateIndicator rate={rates.openRate} benchmark={30} label="Open Rate" />
        <RateIndicator rate={rates.replyRate} benchmark={3} label="Reply Rate" />
        <RateIndicator rate={rates.positiveRate} benchmark={25} label="Positive Rate" />
        <RateIndicator rate={rates.meetingRate} benchmark={40} label="Meeting Rate" />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Funnel Chart */}
        <div
          className={`rounded-xl p-5 ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}
        >
          <h3 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Conversion Funnel
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                    border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: isDarkMode ? '#fff' : '#0f172a' }}
                />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList
                    position="right"
                    fill={isDarkMode ? '#94a3b8' : '#64748b'}
                    stroke="none"
                    dataKey="name"
                  />
                  <LabelList
                    position="center"
                    fill="#fff"
                    stroke="none"
                    dataKey="value"
                    formatter={(value) =>
                      typeof value === 'number' ? value.toLocaleString() : String(value)
                    }
                  />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Campaign Comparison */}
        <div
          className={`rounded-xl p-5 ${
            isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white border border-slate-200'
          }`}
        >
          <h3 className={`font-medium mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Campaign Comparison
          </h3>
          <div className="h-64">
            {campaignComparisonData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignComparisonData} layout="vertical">
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? '#334155' : '#e2e8f0'}
                  />
                  <XAxis type="number" stroke={isDarkMode ? '#64748b' : '#94a3b8'} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={100}
                    stroke={isDarkMode ? '#64748b' : '#94a3b8'}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                      border: isDarkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: isDarkMode ? '#fff' : '#0f172a' }}
                  />
                  <Bar dataKey="reached" fill="#3b82f6" name="Reached" />
                  <Bar dataKey="replies" fill="#8b5cf6" name="Replies" />
                  <Bar dataKey="meetings" fill="#22c55e" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>
                  No campaign data available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div
        className={`rounded-xl p-5 ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30'
            : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            AI Insights
          </h3>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, index) => (
            <li
              key={index}
              className={`flex items-start gap-2 text-sm ${
                isDarkMode ? 'text-slate-300' : 'text-slate-700'
              }`}
            >
              <span className="text-purple-500 mt-1">•</span>
              {insight}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CampaignAnalytics;
