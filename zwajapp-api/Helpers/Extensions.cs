using System;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using ZwajApp.API.Helpers;

namespace zwajapp_api.Helpers
{
    public static class Extensions
    {
        public static void AddApplicationError (this HttpResponse response , string message){
            response.Headers.Add("Application-Error" , message);
            response.Headers.Add("Access-Control-Expose-Headers" , "Application-Error");
            response.Headers.Add("Access-Control-Allow-Origin" , "*");
        }
        public static int CalculateAge(this DateTime dateTime){
            var age  = DateTime.Today.Year - dateTime.Year;
            //  لو الشهر لسه مجاش او عدي الشهر للميلاد يزيد سنه فحتي يصبح التاريخ صح نطرح سنه
            if(dateTime.AddYears(age)> DateTime.Today) age--;
            return age;
        }

        public static void AddPagination (this HttpResponse response , int currentPage, int itemPerPage , int totalItmes , int totalPages)
        {
           var paginationHeader = new PginationHeader(currentPage,itemPerPage,totalItmes,totalPages);
           var camelCaseFormatter= new JsonSerializerSettings();
           camelCaseFormatter.ContractResolver = new CamelCasePropertyNamesContractResolver();
           response.Headers.Add("Pagination",JsonConvert.SerializeObject(paginationHeader,camelCaseFormatter));
           response.Headers.Add("Access-Control-Expose-Headers","Pagination");
        }
    }

}