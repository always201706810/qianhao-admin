// 定义角色类型
export type Role = 'admin' | 'district_admin' | 'number_admin';

// 号码记录接口 (用于已沟通/待沟通页面)
export interface NumberRecord {
  id: number;
  number: string;        // 所选号码
  customerName: string;  // 姓名
  contact: string;       // 联系方式
  status: 'pending' | 'rejected' | 'processed' | 'expired'; 
  createTime: string;    // 填报时间
  region?: string;       // 所属区域
}