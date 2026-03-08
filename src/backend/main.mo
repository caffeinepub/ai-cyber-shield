import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Random "mo:core/Random";
import Order "mo:core/Order";

actor {
  type RiskLevel = {
    #low;
    #medium;
    #high;
    #critical;
  };

  module RiskLevel {
    public func compare(risk1 : RiskLevel, risk2 : RiskLevel) : Order.Order {
      switch (risk1, risk2) {
        case (#low, #low) { #equal };
        case (#low, _) { #less };
        case (#medium, #low) { #greater };
        case (#medium, #medium) { #equal };
        case (#medium, _) { #less };
        case (#high, #critical) { #less };
        case (#high, #high) { #equal };
        case (#high, _) { #greater };
        case (#critical, #critical) { #equal };
        case (#critical, _) { #greater };
      };
    };
  };

  type ScanRecord = {
    id : Nat;
    moduleName : Text;
    inputSummary : Text;
    resultScore : Nat;
    riskLevel : RiskLevel;
    timestamp : Int;
  };

  module ScanRecord {
    public func compareByTimestamp(scan1 : ScanRecord, scan2 : ScanRecord) : Order.Order {
      Int.compare(scan2.timestamp, scan1.timestamp);
    };
  };

  type ThreatEntry = {
    id : Nat;
    threatType : Text;
    location : Text;
    severity : Text;
    description : Text;
    timestamp : Int;
  };

  module ThreatEntry {
    public func compareByTimestamp(entry1 : ThreatEntry, entry2 : ThreatEntry) : Order.Order {
      Int.compare(entry2.timestamp, entry1.timestamp);
    };
  };

  type PlatformStats = {
    totalScans : Nat;
    threatsDetected : Nat;
    activeAlerts : Nat;
  };

  type ModuleCount = {
    moduleName : Text;
    count : Nat;
  };

  let scanHistory = List.empty<ScanRecord>();
  let threatFeed = List.empty<ThreatEntry>();
  var scanId = 1;
  var threatId = 1;
  var platformStats : PlatformStats = {
    totalScans = 0;
    threatsDetected = 0;
    activeAlerts = 0;
  };

  public shared ({ caller }) func submitScan(moduleName : Text, inputSummary : Text, resultScore : Nat, riskLevel : RiskLevel) : async Nat {
    if (resultScore > 100) { Runtime.trap("Result score cannot be higher than 100") };
    let scan : ScanRecord = {
      id = scanId;
      moduleName;
      inputSummary;
      resultScore;
      riskLevel;
      timestamp = Time.now();
    };

    scanHistory.add(scan);
    scanId += 1;
    platformStats := {
      totalScans = platformStats.totalScans + 1;
      threatsDetected = platformStats.threatsDetected;
      activeAlerts = platformStats.activeAlerts;
    };
    scan.id;
  };

  public query ({ caller }) func getScanHistory() : async [ScanRecord] {
    scanHistory.toArray().sliceToArray(0, 50).sort(ScanRecord.compareByTimestamp);
  };

  public query ({ caller }) func getThreatFeed() : async [ThreatEntry] {
    threatFeed.toArray().sliceToArray(0, 20).sort(ThreatEntry.compareByTimestamp);
  };

  public query ({ caller }) func getPlatformStats() : async PlatformStats {
    platformStats;
  };

  public shared ({ caller }) func getScanCountsByModule() : async [ModuleCount] {
    let moduleCounts = List.empty<(Text, Nat)>();

    for (scan in scanHistory.values()) {
      let existing = moduleCounts.find(func((name, _)) { name == scan.moduleName });
      switch (existing) {
        case (null) {
          moduleCounts.add((scan.moduleName, 1));
        };
        case (?oldCount) {
          let filtered = moduleCounts.filter(func((name, _)) { name != scan.moduleName });
          moduleCounts.clear();
          moduleCounts.addAll(filtered.values());
          moduleCounts.add((scan.moduleName, oldCount.1 + 1));
        };
      };
    };

    moduleCounts.toArray().map(func(entry) { { moduleName = entry.0; count = entry.1 } });
  };

  func initializeThreatFeed() {
    let threats = [
      {
        id = threatId;
        threatType = "Phishing";
        location = "India";
        severity = "High";
        description = "Fake banking website targeting users";
        timestamp = Time.now() - 1_000_000_000;
      },
      {
        id = threatId + 1;
        threatType = "Deepfake Scam";
        location = "India";
        severity = "Critical";
        description = "Fake celebrity investment videos circulating";
        timestamp = Time.now() - 10_000_000_000;
      },
      {
        id = threatId + 2;
        threatType = "UPI Fraud";
        location = "Delhi";
        severity = "Medium";
        description = "Fake merchant QR codes reported";
        timestamp = Time.now() - 20_000_000_000;
      },
      {
        id = threatId + 3;
        threatType = "Job Scam";
        location = "Bangalore";
        severity = "High";
        description = "Fake job interview requests with malicious links";
        timestamp = Time.now() - 30_000_000_000;
      },
      {
        id = threatId + 4;
        threatType = "Ransomware";
        location = "Mumbai";
        severity = "Critical";
        description = "Targeted attacks on small businesses";
        timestamp = Time.now() - 40_000_000_000;
      },
      {
        id = threatId + 5;
        threatType = "Data Breach";
        location = "Chennai";
        severity = "High";
        description = "Customer data leaked from major retailer";
        timestamp = Time.now() - 50_000_000_000;
      },
      {
        id = threatId + 6;
        threatType = "Whatsapp Scam";
        location = "India";
        severity = "Medium";
        description = "Fake lottery messages spreading";
        timestamp = Time.now() - 60_000_000_000;
      },
      {
        id = threatId + 7;
        threatType = "SIM Swap Fraud";
        location = "Hyderabad";
        severity = "High";
        description = "Increased cases reported by telecom providers";
        timestamp = Time.now() - 70_000_000_000;
      },
      {
        id = threatId + 8;
        threatType = "Online Shopping Scam";
        location = "Pune";
        severity = "Medium";
        description = "Fake e-commerce sites selling electronics";
        timestamp = Time.now() - 80_000_000_000;
      },
      {
        id = threatId + 9;
        threatType = "PAN Card Fraud";
        location = "India";
        severity = "High";
        description = "Identity theft through fake PAN card requests";
        timestamp = Time.now() - 90_000_000_000;
      },
    ];

    threatFeed.addAll(threats.values());
    threatId += 10;
  };

  public query ({ caller }) func analyzeText(text : Text) : async Nat {
    let keywords = [
      "urgent",
      "free money",
      "click here",
      "verify account",
      "OTP",
      "prize",
      "winner",
      "limited offer",
      "bank details",
      "password",
    ];

    var score = 0;
    for (keyword in keywords.values()) {
      if (text.toLower().contains(#text(keyword.toLower()))) {
        score += 10;
      };
    };

    let lengthFactor = if (text.size() > 100) { 90 } else {
      90 * text.size() / 100;
    };

    (score + lengthFactor) / 2;
  };

  public query ({ caller }) func checkPasswordStrength(password : Text) : async Nat {
    let lengthScore = if (password.size() >= 12) { 40 } else {
      40 * password.size() / 12;
    };

    var varietyScore = 0;
    if (password.toArray().find(func(c) { c >= 'A' and c <= 'Z' }) != null) {
      varietyScore += 20;
    };
    if (password.toArray().find(func(c) { c >= 'a' and c <= 'z' }) != null) {
      varietyScore += 20;
    };
    if (password.toArray().find(func(c) { c.isDigit() }) != null) {
      varietyScore += 10;
    };
    if (password.toArray().find(func(c) { not c.isDigit() and not (c >= 'A' and c <= 'Z') and not (c >= 'a' and c <= 'z') }) != null) {
      varietyScore += 10;
    };

    let strengthScore = lengthScore + varietyScore;
    if (strengthScore > 100) { 100 } else { strengthScore };
  };

  initializeThreatFeed();
};
