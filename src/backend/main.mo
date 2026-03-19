import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Referral = {
    referrer : Principal;
    referred : Principal;
    bonusAmount : Nat;
    level : Nat;
  };

  module Referral {
    public func compare(referral1 : Referral, referral2 : Referral) : Order.Order {
      Nat.compare(referral1.bonusAmount, referral2.bonusAmount);
    };
  };

  type ReferralHistory = {
    level1Earnings : Nat;
    level2Earnings : Nat;
    level3Earnings : Nat;
    totalEarnings : Nat;
    referralsGiven : Int; // Represent as integer
    referralsReceived : Int; // Represent as integer
    bonusEarned : Int; // Represent as integer
    rank : Nat;
  };

  type Bill = {
    billId : Text;
    amount : Nat;
    status : Text;
    confirmed : Bool;
  };

  type DailyStats = {
    date : Text;
    sellCount : Int; // Represent as integer
    depositsCount : Int; // Represent as integer
    totalTransactions : Int; // Represent as integer
    volumeINR : Int; // Represent as integer
  };

  type Profile = {
    name : Text;
    balance : Int; // Represent as integer
    zpayId : Text;
    sellEnabled : Bool;
    referralHistory : ReferralHistory;
  };

  let supportAgents = List.empty<Text>();
  let supportAgentsMap = Map.empty<Nat, Text>();

  public shared ({ caller }) func initialize() : async () {
    supportAgents.clear();
    supportAgents.add("+919457701417");
    supportAgents.add("+917249120008");
    supportAgents.add("+918174832026");
    supportAgents.add("+918174243742");
    supportAgents.add("+918192772152");
    supportAgents.add("+91495006");
    supportAgents.add("+91002345");
    supportAgents.add("+91000642");
    supportAgents.add("+91124125");
    supportAgents.add("+91125411");

    supportAgentsMap.clear();
    supportAgentsMap.add(1, "+919457701417");
    supportAgentsMap.add(2, "+917249120008");
    supportAgentsMap.add(3, "+918174832026");
    supportAgentsMap.add(4, "+918174243742");
    supportAgentsMap.add(5, "+918192772152");
    supportAgentsMap.add(6, "+91495006");
    supportAgentsMap.add(7, "+91002345");
    supportAgentsMap.add(8, "+91000642");
    supportAgentsMap.add(9, "+91124125");
    supportAgentsMap.add(10, "+91125411");
  };

  type ZPayRecord = {
    amount : Int;
    senderId : Text;
    receiverId : Text;
    transactionType : Text;
    timestamp : Time.Time;
    status : Text;
  };

  type FcmToken = {
    userId : Text;
    deviceToken : Text;
    lastUpdated : Time.Time;
  };

  type TradeOrder = {
    orderId : Text;
    amountINR : Int;
    transactionType : Text;
    userId : Text;
    status : Text;
    timestamp : Time.Time;
  };

  type AppLog = {
    logId : Text;
    message : Text;
    timestamp : Time.Time;
    logLevel : Text;
  };

  let profiles = Map.empty<Text, Profile>();
  let referralLinks = Map.empty<Text, Text>();
  let helpers = Map.empty<Text, Profile>();

  public query ({ caller }) func getOrderDetails(orderId : Text, orderType : Text) : async Text {
    orderType # ": " # orderId;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func updateUserCustom(_zpayId : Text, name : Text) : async () {
    let profile : Profile = {
      name;
      balance = 0;
      zpayId = _zpayId;
      sellEnabled = false;
      referralHistory = {
        level1Earnings = 0;
        level2Earnings = 0;
        level3Earnings = 0;
        totalEarnings = 0;
        referralsGiven = 0;
        referralsReceived = 0;
        bonusEarned = 0;
        rank = 0;
      };
    };
    profiles.add(_zpayId, profile);
  };

  public query ({ caller }) func getId(_id : Text) : async Text {
    _id;
  };

  public type Stats = {
    dailyVolume : Int;
    transferCount : Int;
    depositCount : Int;
  };

  let updatedStats : Stats = {
    dailyVolume = 0;
    transferCount = 0;
    depositCount = 0;
  };

  public query ({ caller }) func getTotalStats() : async Stats {
    updatedStats;
  };
};
