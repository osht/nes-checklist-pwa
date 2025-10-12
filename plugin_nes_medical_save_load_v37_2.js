/*! NES Checklist PWA Add‑Ons v37.2
 *  - Medical Appointment modal (no alarm)
 *  - Save / Load (export/import localStorage)
 *  Drop‑in script. Safe on v36+.
 */
(function(){
  function $(sel, root){ return (root||document).querySelector(sel); }
  function $all(sel, root){ return (root||document).querySelectorAll(sel); }

  // ---- Save / Load all app data (localStorage) ----
  function exportAll(){
    var data = {};
    try{
      for(var i=0;i<localStorage.length;i++){
        var k = localStorage.key(i);
        try{ data[k] = localStorage.getItem(k); }catch(e){}
      }
      var blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a'); a.href = url; a.download = 'nes_checklist_backup.json';
      document.body.appendChild(a); a.click();
      setTimeout(function(){ URL.revokeObjectURL(url); a.remove(); }, 0);
    }catch(e){ alert('Export failed: '+e); }
  }
  function importAllFromFile(file){
    var reader = new FileReader();
    reader.onload = function(){
      try{
        var obj = JSON.parse(reader.result||'{}');
        for(var k in obj){ if(Object.prototype.hasOwnProperty.call(obj,k)){ try{ localStorage.setItem(k, obj[k]); }catch(e){} } }
        alert('Data loaded. The page will refresh to apply it.');
        setTimeout(function(){ location.reload(); }, 400);
      }catch(e){ alert('Bad file format.'); }
    };
    reader.readAsText(file);
  }

  function injectToolbar(){
    if (document.getElementById('btnSaveAll')) return;
    var host = document.querySelector('header') || document.body;
    var wrap = document.createElement('div');
    wrap.className = 'util-actions';
    wrap.style.cssText = 'padding:8px;display:flex;gap:8px;justify-content:flex-end;';
    wrap.innerHTML = ''
      + '<button id="btnSaveAll" class="btn btn-secondary">Save Data</button>'
      + '<button id="btnLoadAll" class="btn btn-secondary">Load Data</button>'
      + '<input id="loadFileInput" type="file" accept="application/json" style="display:none;">';
    host.insertBefore(wrap, host.firstChild);

    var saveBtn = document.getElementById('btnSaveAll');
    var loadBtn = document.getElementById('btnLoadAll');
    var fileIn  = document.getElementById('loadFileInput');
    if (saveBtn) saveBtn.addEventListener('click', function(){ exportAll(); });
    if (loadBtn) loadBtn.addEventListener('click', function(){ if(fileIn) fileIn.click(); });
    if (fileIn) fileIn.addEventListener('change', function(e){ var f=(e.target.files||[])[0]; if(f) importAllFromFile(f); });
  }

  // ---- Medical Appointment (no alarm) ----
  var APPT_PREFIX='nes.appts.';
  function currentSheet(){ var s=document.getElementById('sheetSelect'); return s&&s.value?s.value:'default'; }
  function apptKey(){ return APPT_PREFIX + currentSheet(); }
  function loadAppts(){ try{ var raw=localStorage.getItem(apptKey()); return raw?JSON.parse(raw):[]; }catch(e){ return []; } }
  function saveAppts(list){ try{ localStorage.setItem(apptKey(), JSON.stringify(list||[])); }catch(e){} }

  function ensureModal(){
    if (document.getElementById('apptModal')) return;
    var modal = document.createElement('div');
    modal.id = 'apptModal';
    modal.className = 'modal';
    modal.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;align-items:center;justify-content:center;';
    modal.innerHTML = ''
      + '<div class="modal-card" style="background:#fff;color:#111;max-width:560px;width:92vw;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,.25);overflow:hidden;font-family:inherit;">'
      + '  <div class="modal-header" style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--line,#ddd)">'
      + '    <div style="font-weight:700;font-size:18px;">Medical Appointment</div>'
      + '    <button id="apptCloseBtn" class="btn btn-secondary" style="min-width:auto;padding:6px 10px;">Close</button>'
      + '  </div>'
      + '  <div class="modal-body" style="padding:14px 16px;display:flex;flex-direction:column;gap:10px;">'
      + '    <label style="font-weight:600;">Date</label>'
      + '    <input type="date" id="apptDate" style="padding:8px;border:1px solid var(--line,#ccc);border-radius:8px;">'
      + '    <label style="font-weight:600;">Time</label>'
      + '    <input type="time" id="apptTime" style="padding:8px;border:1px solid var(--line,#ccc);border-radius:8px;">'
      + '    <label style="font-weight:600;">Notes (optional)</label>'
      + '    <input type="text" id="apptNotes" placeholder="Provider name, address, reason..." style="padding:8px;border:1px solid var(--line,#ccc);border-radius:8px;">'
      + '    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px;">'
      + '      <button id="apptSaveBtn" class="btn btn-primary">Save</button>'
      + '      <button id="apptIcsBtn" class="btn btn-secondary" title="Create calendar file">Add to Calendar (.ics)</button>'
      + '      <button id="apptDeviceCalBtn" class="btn btn-secondary">Open in Calendar</button>'
      + '    </div>'
      + '    <div id="apptListWrap" style="margin-top:10px;">'
      + '      <div style="font-weight:700;margin-bottom:6px;">Saved Appointments</div>'
      + '      <ul id="apptList" style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;"></ul>'
      + '    </div>'
      + '  </div>'
      + '</div>';
    document.body.appendChild(modal);

    // Wire modal
    var m = modal;
    var closeBtn = document.getElementById('apptCloseBtn');
    if (closeBtn) closeBtn.addEventListener('click', function(){ closeApptModal(); });
    if (m) m.addEventListener('click', function(e){ if(e.target===m) closeApptModal(); });
    var saveBtn=document.getElementById('apptSaveBtn'); if(saveBtn) saveBtn.addEventListener('click', function(){ saveCurrentFromInputs(); });
    var icsBtn=document.getElementById('apptIcsBtn'); if(icsBtn) icsBtn.addEventListener('click', function(){
      var a={date:document.getElementById('apptDate').value||'',time:document.getElementById('apptTime').value||'',notes:document.getElementById('apptNotes').value||''};
      if(!a.date){ alert('Pick a date first'); return; } downloadIcs(a);
    });
    var dcBtn=document.getElementById('apptDeviceCalBtn'); if(dcBtn) dcBtn.addEventListener('click', function(){
      var a={date:document.getElementById('apptDate').value||'',time:document.getElementById('apptTime').value||'',notes:document.getElementById('apptNotes').value||''};
      if(!a.date){ alert('Pick a date first'); return; } openDeviceCalendar(a);
    });
  }

  function openApptModal(prefill){
    ensureModal();
    document.getElementById('apptDate').value = prefill && prefill.date ? prefill.date : '';
    document.getElementById('apptTime').value = prefill && prefill.time ? prefill.time : '';
    document.getElementById('apptNotes').value = prefill && prefill.notes ? prefill.notes : '';
    renderApptList();
    document.getElementById('apptModal').style.display='flex';
  }
  function closeApptModal(){ var m=document.getElementById('apptModal'); if(m) m.style.display='none'; }

  function renderApptList(){
    var ul=document.getElementById('apptList'); if(!ul) return;
    var list=loadAppts(); ul.innerHTML='';
    if(!list.length){
      var li=document.createElement('li'); li.textContent='No appointments saved yet.'; li.style.color='#555'; ul.appendChild(li); return;
    }
    for(var i=0;i<list.length;i++){ (function(idx){
      var a=list[idx];
      var li=document.createElement('li'); li.style.border='1px solid var(--line,#ddd)'; li.style.borderRadius='8px'; li.style.padding='8px';
      var row=document.createElement('div'); row.style.display='flex'; row.style.justifyContent='space-between'; row.style.alignItems='center'; row.style.gap='10px';
      var left=document.createElement('div'); left.innerHTML='<strong>'+(a.date||'')+'</strong> '+(a.time||'')+(a.notes?(' — '+a.notes):'');
      var right=document.createElement('div');
      function mkBtn(txt,cb){ var b=document.createElement('button'); b.className='btn btn-secondary'; b.style.marginLeft='6px'; b.textContent=txt; b.onclick=cb; return b; }
      right.appendChild(mkBtn('ICS', function(){ downloadIcs(a); }));
      right.appendChild(mkBtn('Calendar', function(){ openDeviceCalendar(a); }));
      right.appendChild(mkBtn('Delete', function(){ deleteAppt(idx); }));
      row.appendChild(left); row.appendChild(right); li.appendChild(row); ul.appendChild(li);
    })(i); }
  }
  function deleteAppt(idx){ var list=loadAppts(); list.splice(idx,1); saveAppts(list); renderApptList(); }

  function parseInputToDateTime(dateStr,timeStr){
    if(!dateStr) return null;
    var p=dateStr.split('-'); if(p.length<3) return null;
    var yr=parseInt(p[0],10), mo=parseInt(p[1],10)-1, dy=parseInt(p[2],10);
    var hr=0, mi=0; if(timeStr){ var tp=timeStr.split(':'); if(tp.length>=2){ hr=parseInt(tp[0],10)||0; mi=parseInt(tp[1],10)||0; } }
    return new Date(yr,mo,dy,hr,mi,0);
  }
  function pad(n){ return (n<10?'0':'')+n; }
  function toICSDate(dt){ return dt.getUTCFullYear()+''+pad(dt.getUTCMonth()+1)+pad(dt.getUTCDate())+'T'+pad(dt.getUTCHours())+pad(dt.getUTCMinutes())+'Z'; }

  function buildIcs(a){
    var dt=parseInputToDateTime(a.date,a.time)||new Date();
    var dtEnd=new Date(dt.getTime()+60*60*1000);
    var summary='Medical Appointment';
    var desc=a.notes?a.notes:'NES appointment';
    var ics=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//NES Checklist//Appointments//EN','BEGIN:VEVENT','DTSTAMP:'+toICSDate(new Date()),'DTSTART:'+toICSDate(dt),'DTEND:'+toICSDate(dtEnd),'SUMMARY:'+summary,'DESCRIPTION:'+desc.replace(/\\n/g,'\\\\n'),'END:VEVENT','END:VCALENDAR'].join('\\r\\n');
    return ics;
  }
  function downloadIcs(a){
    var ics=buildIcs(a);
    var blob=new Blob([ics],{type:'text/calendar'});
    var url=URL.createObjectURL(blob);
    var at=document.createElement('a');
    at.href=url; at.download='NES_Medical_Appt.ics';
    document.body.appendChild(at);
    at.click();
    setTimeout(function(){ URL.revokeObjectURL(url); at.remove(); },0);
  }
  function openDeviceCalendar(a){
    var ics=buildIcs(a);
    try{
      var blob=new Blob([ics],{type:'text/calendar'});
      var url=URL.createObjectURL(blob);
      var w=window.open(url,'_blank');
      if(!w){
        var at=document.createElement('a'); at.href=url; at.download='NES_Medical_Appt.ics';
        document.body.appendChild(at); at.click();
        setTimeout(function(){ URL.revokeObjectURL(url); at.remove(); },0);
      }else{
        setTimeout(function(){ URL.revokeObjectURL(url); }, 4000);
      }
    }catch(e){
      downloadIcs(a);
    }
  }
  function saveCurrentFromInputs(){
    var date=(document.getElementById('apptDate')&&document.getElementById('apptDate').value||'').trim();
    var time=(document.getElementById('apptTime')&&document.getElementById('apptTime').value||'').trim();
    var notes=(document.getElementById('apptNotes')&&document.getElementById('apptNotes').value||'').trim();
    if(!date){ alert('Please choose a date'); return; }
    var list=loadAppts(); list.push({date:date,time:time,notes:notes}); saveAppts(list); renderApptList(); alert('Appointment saved.');
  }

  function ensureApptButton(){
    var labels=document.querySelectorAll('.label, label, li .label'); var targets=[];
    for(var i=0;i<labels.length;i++){
      var el=labels[i]; var txt=(el.textContent||'').trim().toLowerCase();
      if(txt.indexOf('client medical assesment form')!==-1){ targets.push(el); }
    }
    for(var j=0;j<targets.length;j++){
      var host=targets[j];
      if(host.nextSibling && host.nextSibling.classList && host.nextSibling.classList.contains('appt-action')) continue;
      var btn=document.createElement('button'); btn.className='appt-action'; btn.type='button'; btn.textContent='Medical Appt';
      btn.addEventListener('click', function(e){ e.stopPropagation(); openApptModal(null); });
      if(host && host.parentNode){ host.parentNode.insertBefore(btn, host.nextSibling); }
    }
  }

  (function injectCss(){
    if (document.getElementById('nes-addon-css')) return;
    var css = '/* NES add-on v37.2 */\\n'
            + '.appt-action{margin-left:8px;font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid var(--line,#c7c7c7);background:var(--panel,#f7f7f9);cursor:pointer;}\\n'
            + '.appt-action:hover{filter:brightness(0.98);}\\n'
            + '.util-actions{display:flex;gap:8px;align-items:center;}\\n'
            + '.util-actions .btn{padding:6px 10px;font-size:12px;}\\n';
    var style = document.createElement('style'); style.id='nes-addon-css'; style.textContent = css; document.head.appendChild(style);
  })();

  document.addEventListener('DOMContentLoaded', function(){
    injectToolbar();
    ensureApptButton();
  });
  document.addEventListener('change', function(e){
    var t=e.target||e.srcElement; if(t && t.id==='sheetSelect'){ setTimeout(ensureApptButton, 50); }
  }, true);
})();